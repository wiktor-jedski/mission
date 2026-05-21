import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateMapProgress,
  canSubmitProof,
  createSubmissionDraft
} from "@/lib/domain/game";
import type {
  AppSettings,
  MapProgressSnapshot,
  Quest,
  Submission,
  Team,
  TeamQuestProgress
} from "@/lib/domain/types";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  AdminReviewActionResult,
  PendingSubmissionReview,
  QuestAccessResult,
  RejectSubmissionInput,
  RuntimeRepository,
  SubmitProofInput,
  SubmitProofResult
} from "./repository";

type SupabaseError = { message: string };
type QueryResult<Row> = { data: Row | null; error: SupabaseError | null };
type QueryManyResult<Row> = { data: Row[] | null; error: SupabaseError | null };

type RpcClient = {
  rpc(
    name: "approve_submission_for_review",
    args: { reviewed_submission_id: string; reviewed_at_value: string }
  ): Promise<QueryResult<Json>>;
  rpc(
    name: "reject_submission_for_review",
    args: {
      reviewed_submission_id: string;
      rejection_reason_value: string;
      rejection_message_value: string | null;
      reviewed_at_value: string;
    }
  ): Promise<QueryResult<Json>>;
};

type LooseMutationTable = {
  insert(value: unknown): Promise<{ error: SupabaseError | null }>;
  update(value: unknown): {
    eq(column: string, value: string): Promise<{ error: SupabaseError | null }>;
  };
};

type LooseMutationClient = {
  from(table: string): LooseMutationTable;
};

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
type QuestRow = Database["public"]["Tables"]["quests"]["Row"];
type ProgressRow = Database["public"]["Tables"]["team_quest_progress"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];
type AppSettingsRow = Database["public"]["Tables"]["app_settings"]["Row"];

export class SupabaseRuntimeRepository implements RuntimeRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getTeams(): Promise<readonly Team[]> {
    const result = await this.client
      .from("teams")
      .select("*")
      .order("name", { ascending: true });
    return requireRows(result).map(mapTeam);
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const result = await this.client
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .maybeSingle();
    return maybeRow(result, mapTeam);
  }

  async getQuests(): Promise<readonly Quest[]> {
    const result = await this.client
      .from("quests")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });
    return requireRows(result).map(mapQuest);
  }

  async getQuestBySlug(slug: string): Promise<Quest | null> {
    const normalizedSlug = slug.trim();

    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return null;
    }

    const result = await this.client
      .from("quests")
      .select("*")
      .eq("slug", normalizedSlug)
      .eq("is_active", true)
      .maybeSingle();
    return maybeRow(result, mapQuest);
  }

  async getQuestAccess(teamId: string, slug: string): Promise<QuestAccessResult> {
    const [team, quest] = await Promise.all([
      this.getTeam(teamId),
      this.getQuestBySlug(slug)
    ]);

    if (!team || !quest) {
      return { status: "not_found" };
    }

    const progress = await this.getOrCreateProgress(team.id, quest.id);
    const submissions = await this.getTeamQuestSubmissions(team.id, quest.id);

    return { status: "found", quest, progress, submissions };
  }

  async getTeamSubmissions(teamId: string): Promise<readonly Submission[]> {
    const result = await this.client
      .from("submissions")
      .select("*")
      .eq("team_id", teamId)
      .order("submitted_at", { ascending: false });
    return requireRows(result).map(mapSubmission);
  }

  async submitProof(input: SubmitProofInput): Promise<SubmitProofResult> {
    const questAccess = await this.getQuestAccess(input.teamId, input.questSlug);

    if (questAccess.status === "not_found") {
      return { status: "quest_not_found" };
    }

    const permission = canSubmitProof(
      input.teamId,
      questAccess.quest.id,
      questAccess.submissions,
      [questAccess.progress]
    );

    if (!permission.allowed) {
      return { status: "blocked", reason: permission.reason };
    }

    const submittedAt = new Date().toISOString();
    const created = createSubmissionDraft(
      {
        id: crypto.randomUUID(),
        teamId: input.teamId,
        questId: questAccess.quest.id,
        contributorName: input.contributorName,
        proofKind: questAccess.quest.proofKind,
        proofValue: input.proofValue,
        note: input.note
      },
      questAccess.progress,
      submittedAt
    );

    const submissionInsert = await this.mutations()
      .from("submissions")
      .insert([toSubmissionInsert(created.submission)]);
    requireSuccess(submissionInsert);

    const progressUpdate = await this.mutations()
      .from("team_quest_progress")
      .update(toProgressUpdate(created.progress, submittedAt))
      .eq("id", created.progress.id);
    requireSuccess(progressUpdate);

    const auditInsert = await this.mutations().from("audit_logs").insert({
      id: crypto.randomUUID(),
      actor_type: "team",
      actor_id: input.teamId,
      action: "submission_created",
      team_id: created.submission.teamId,
      quest_id: created.submission.questId,
      submission_id: created.submission.id,
      created_at: submittedAt
    });
    requireSuccess(auditInsert);

    return {
      status: "created",
      submission: created.submission,
      progress: created.progress
    };
  }

  async getTeamMapState(teamId: string): Promise<MapProgressSnapshot> {
    const progressRows = await this.getTeamProgressRows(teamId);
    const settings = await this.getAppSettings();
    return calculateMapProgress(progressRows, settings.requiredApprovalCount);
  }

  async listPendingSubmissions(): Promise<readonly PendingSubmissionReview[]> {
    const result = await this.client
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });
    const submissions = requireRows(result).map(mapSubmission);
    const reviews = await Promise.all(
      submissions.map((submission) => this.buildReview(submission))
    );

    return reviews.filter((review) => review !== null);
  }

  async getPendingSubmission(
    submissionId: string
  ): Promise<PendingSubmissionReview | null> {
    if (!isSafeId(submissionId)) {
      return null;
    }

    const result = await this.client
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .eq("status", "pending")
      .maybeSingle();
    const submission = maybeRow(result, mapSubmission);
    return submission ? this.buildReview(submission) : null;
  }

  async approveSubmission(
    submissionId: string
  ): Promise<AdminReviewActionResult> {
    const current = await this.getPendingSubmission(submissionId);

    if (!current) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    await this.rpc().rpc("approve_submission_for_review", {
      reviewed_submission_id: submissionId,
      reviewed_at_value: reviewedAt
    });
    const review = await this.buildReview({
      ...current.submission,
      status: "approved",
      rejectionReason: null,
      rejectionMessage: null,
      reviewedAt
    });

    return review ? { status: "updated", review } : { status: "not_found" };
  }

  async rejectSubmission(
    input: RejectSubmissionInput
  ): Promise<AdminReviewActionResult> {
    const current = await this.getPendingSubmission(input.submissionId);

    if (!current) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    await this.rpc().rpc("reject_submission_for_review", {
      reviewed_submission_id: input.submissionId,
      rejection_reason_value: input.reason,
      rejection_message_value: input.message?.trim() || null,
      reviewed_at_value: reviewedAt
    });
    const review = await this.buildReview({
      ...current.submission,
      status: "rejected",
      rejectionReason: input.reason as Submission["rejectionReason"],
      rejectionMessage: input.message?.trim() || null,
      reviewedAt
    });

    return review ? { status: "updated", review } : { status: "not_found" };
  }

  private async getOrCreateProgress(
    teamId: string,
    questId: string
  ): Promise<TeamQuestProgress> {
    const existing = await this.client
      .from("team_quest_progress")
      .select("*")
      .eq("team_id", teamId)
      .eq("quest_id", questId)
      .maybeSingle();
    const progress = maybeRow(existing, mapProgress);

    if (progress) {
      return progress;
    }

    const insert = await this.mutations()
      .from("team_quest_progress")
      .insert([{ id: `${teamId}-${questId}`, team_id: teamId, quest_id: questId }]);
    requireSuccess(insert);
    return {
      id: `${teamId}-${questId}`,
      teamId,
      questId,
      status: "not_started",
      hintUsedAt: null,
      approvedAt: null,
      skippedAt: null
    };
  }

  private async getTeamQuestSubmissions(
    teamId: string,
    questId: string
  ): Promise<readonly Submission[]> {
    const result = await this.client
      .from("submissions")
      .select("*")
      .eq("team_id", teamId)
      .eq("quest_id", questId)
      .order("submitted_at", { ascending: false });
    return requireRows(result).map(mapSubmission);
  }

  private async getTeamProgressRows(
    teamId: string
  ): Promise<readonly TeamQuestProgress[]> {
    const result = await this.client
      .from("team_quest_progress")
      .select("*")
      .eq("team_id", teamId);
    return requireRows(result).map(mapProgress);
  }

  private async getAppSettings(): Promise<AppSettings> {
    const result = await this.client
      .from("app_settings")
      .select("*")
      .eq("id", "global")
      .single();
    return requireRow(result, mapAppSettings);
  }

  private async buildReview(
    submission: Submission
  ): Promise<PendingSubmissionReview | null> {
    const [team, quest, progress, map] = await Promise.all([
      this.getTeam(submission.teamId),
      this.getQuestById(submission.questId),
      this.getProgressByTeamQuest(submission.teamId, submission.questId),
      this.getTeamMapState(submission.teamId)
    ]);

    if (!team || !quest || !progress) {
      return null;
    }

    return { submission, team, quest, progress, map };
  }

  private async getQuestById(questId: string): Promise<Quest | null> {
    const result = await this.client
      .from("quests")
      .select("*")
      .eq("id", questId)
      .maybeSingle();
    return maybeRow(result, mapQuest);
  }

  private async getProgressByTeamQuest(
    teamId: string,
    questId: string
  ): Promise<TeamQuestProgress | null> {
    const result = await this.client
      .from("team_quest_progress")
      .select("*")
      .eq("team_id", teamId)
      .eq("quest_id", questId)
      .maybeSingle();
    return maybeRow(result, mapProgress);
  }

  private rpc(): RpcClient {
    return this.client as unknown as RpcClient;
  }

  private mutations(): LooseMutationClient {
    return this.client as unknown as LooseMutationClient;
  }
}

const requireRows = <Row>(result: QueryManyResult<Row>): Row[] => {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
};

const requireRow = <Row, Value>(
  result: QueryResult<Row>,
  map: (row: Row) => Value
): Value => {
  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Expected Supabase row was not returned.");
  }

  return map(result.data);
};

const maybeRow = <Row, Value>(
  result: QueryResult<Row>,
  map: (row: Row) => Value
): Value | null => {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ? map(result.data) : null;
};

const requireSuccess = (result: { error: SupabaseError | null }): void => {
  if (result.error) {
    throw new Error(result.error.message);
  }
};

export const mapTeam = (row: TeamRow): Team => ({
  id: row.id,
  name: row.name,
  pinHash: row.pin_hash,
  createdAt: row.created_at
});

export const mapQuest = (row: QuestRow): Quest => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  flavorText: row.flavor_text,
  instructions: row.instructions,
  successCriteria: row.success_criteria,
  safetyWarning: row.safety_warning,
  proofKind: row.proof_kind,
  hintText: row.hint_text,
  isActive: row.is_active
});

export const mapProgress = (row: ProgressRow): TeamQuestProgress => ({
  id: row.id,
  teamId: row.team_id,
  questId: row.quest_id,
  status: row.status,
  hintUsedAt: row.hint_used_at,
  approvedAt: row.approved_at,
  skippedAt: row.skipped_at
});

export const mapSubmission = (row: SubmissionRow): Submission => ({
  id: row.id,
  teamId: row.team_id,
  questId: row.quest_id,
  contributorName: row.contributor_name,
  proofKind: row.proof_kind,
  proofValue: row.proof_value,
  note: row.note,
  status: row.status,
  rejectionReason: row.rejection_reason,
  rejectionMessage: row.rejection_message,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at
});

export const mapAppSettings = (row: AppSettingsRow): AppSettings => ({
  requiredApprovalCount: row.required_approval_count,
  isPaused: row.is_paused
});

const toSubmissionInsert = (
  submission: Submission
): Database["public"]["Tables"]["submissions"]["Insert"] => ({
  id: submission.id,
  team_id: submission.teamId,
  quest_id: submission.questId,
  contributor_name: submission.contributorName,
  proof_kind: submission.proofKind,
  proof_value: submission.proofValue,
  note: submission.note,
  status: submission.status,
  rejection_reason: submission.rejectionReason,
  rejection_message: submission.rejectionMessage,
  submitted_at: submission.submittedAt,
  reviewed_at: submission.reviewedAt
});

const toProgressUpdate = (
  progress: TeamQuestProgress,
  updatedAt: string
): Database["public"]["Tables"]["team_quest_progress"]["Update"] => ({
  status: progress.status,
  hint_used_at: progress.hintUsedAt,
  approved_at: progress.approvedAt,
  skipped_at: progress.skippedAt,
  updated_at: updatedAt
});

const isSafeId = (value: string): boolean =>
  /^[a-zA-Z0-9_-]{1,120}$/.test(value);
