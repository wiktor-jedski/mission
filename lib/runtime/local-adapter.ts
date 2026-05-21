import {
  approveSubmission as approveSubmissionDomain,
  auditMetadata,
  calculateMapProgress,
  createAuditLog,
  createReplacementProofDraft,
  hideManualFragment,
  markHintUsed,
  overrideBrokenQuest,
  rejectSubmission as rejectSubmissionDomain,
  revealManualFragment,
  skipQuest
} from "@/lib/domain/game";
import type {
  AuditLog,
  Quest,
  Submission,
  Team,
  TeamQuestProgress
} from "@/lib/domain/types";
import {
  PlayerRepository,
  type PlayerRepositorySnapshot
} from "@/lib/player/store";
import type {
  AdminReviewActionResult,
  AdminOverrideResult,
  AuditLogEntry,
  HintUsageResult,
  OverrideInput,
  PendingSubmissionReview,
  ReplacementProofInput,
  RejectSubmissionInput,
  RuntimeRepository,
  SubmitProofInput,
  SubmitProofResult
} from "./repository";

type LocalRuntimeSnapshot = PlayerRepositorySnapshot & {
  auditLogs?: readonly AuditLog[];
};

export class LocalRuntimeRepository implements RuntimeRepository {
  private readonly playerRepository: PlayerRepository;
  private auditLogs: AuditLog[];

  constructor(snapshot?: LocalRuntimeSnapshot) {
    this.playerRepository = new PlayerRepository(snapshot);
    this.auditLogs = [...(snapshot?.auditLogs ?? [])];
  }

  async getTeams(): Promise<readonly Team[]> {
    return this.playerRepository.getTeams();
  }

  async getTeam(teamId: string): Promise<Team | null> {
    return this.playerRepository.getTeam(teamId);
  }

  async getQuests(): Promise<readonly Quest[]> {
    return this.playerRepository.snapshot().quests;
  }

  async getQuestBySlug(slug: string): Promise<Quest | null> {
    return this.playerRepository.getQuestBySlug(slug);
  }

  async getQuestAccess(teamId: string, slug: string) {
    return this.playerRepository.getQuestAccess(teamId, slug);
  }

  async recordTeamLogin(teamId: string): Promise<void> {
    if (!this.playerRepository.getTeam(teamId)) {
      return;
    }

    const createdAt = new Date().toISOString();
    this.appendAudit({
      actorType: "team",
      actorId: teamId,
      action: "team_login",
      teamId,
      createdAt
    });
  }

  async recordQuestView(teamId: string, questId: string): Promise<void> {
    if (!this.playerRepository.getTeam(teamId)) {
      return;
    }

    const quest = this.playerRepository
      .snapshot()
      .quests.find((row) => row.id === questId);
    if (!quest) {
      return;
    }

    this.appendAudit({
      actorType: "team",
      actorId: teamId,
      action: "quest_viewed",
      teamId,
      questId,
      createdAt: new Date().toISOString()
    });
  }

  async getTeamSubmissions(teamId: string): Promise<readonly Submission[]> {
    return this.playerRepository.getTeamSubmissions(teamId);
  }

  async submitProof(input: SubmitProofInput): Promise<SubmitProofResult> {
    const result = this.playerRepository.submitProof(input);

    if (result.status === "created") {
      this.auditLogs = [
        ...this.auditLogs,
        createAuditLog({
          id: this.createAuditId(),
          actorType: "team",
          actorId: input.teamId,
          action: "submission_created",
          teamId: result.submission.teamId,
          questId: result.submission.questId,
          submissionId: result.submission.id,
          createdAt: result.submission.submittedAt
        })
      ];
    }

    return result;
  }

  async useHint(teamId: string, questSlug: string): Promise<HintUsageResult> {
    const access = this.playerRepository.getQuestAccess(teamId, questSlug);

    if (access.status === "not_found") {
      return { status: "not_found" };
    }

    const usedAt = new Date().toISOString();

    if (!access.quest.hintText?.trim()) {
      return { status: "no_hint" };
    }

    const result = markHintUsed(access.quest, access.progress, usedAt);
    this.playerRepository.replaceProgress(result.progress);
    if (result.newlyUsed) {
      this.appendAudit({
        actorType: "team",
        actorId: teamId,
        action: "hint_used",
        teamId,
        questId: access.quest.id,
        metadata: auditMetadata({ repeated: false }),
        createdAt: usedAt
      });
    }
    return { status: "updated", progress: result.progress };
  }

  async getTeamMapState(teamId: string) {
    const progressRows = this.playerRepository
      .snapshot()
      .progressRows.filter((progress) => progress.teamId === teamId);

    const team = this.playerRepository.getTeam(teamId);
    return calculateMapProgress(
      progressRows,
      undefined,
      team?.mapProgressCount
    );
  }

  async listAuditLogs(limit = 100): Promise<readonly AuditLogEntry[]> {
    const snapshot = this.playerRepository.snapshot();
    return this.auditLogs
      .slice()
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .slice(0, limit)
      .map((audit) => ({
        audit,
        team: audit.teamId
          ? snapshot.teams.find((team) => team.id === audit.teamId) ?? null
          : null,
        quest: audit.questId
          ? snapshot.quests.find((quest) => quest.id === audit.questId) ?? null
          : null,
        submission: audit.submissionId
          ? snapshot.submissions.find(
              (submission) => submission.id === audit.submissionId
            ) ?? null
          : null
      }));
  }

  async listPendingSubmissions(): Promise<readonly PendingSubmissionReview[]> {
    return this.buildPendingReviews();
  }

  async getPendingSubmission(
    submissionId: string
  ): Promise<PendingSubmissionReview | null> {
    return (
      this.buildPendingReviews().find(
        (review) => review.submission.id === submissionId
      ) ?? null
    );
  }

  async approveSubmission(
    submissionId: string
  ): Promise<AdminReviewActionResult> {
    const snapshot = this.playerRepository.snapshot();
    const submission = snapshot.submissions.find((row) => row.id === submissionId);

    if (!submission) {
      return { status: "not_found" };
    }

    if (submission.status !== "pending") {
      return { status: "invalid_transition" };
    }

    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!progress) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    const updated = approveSubmissionDomain(submission, progress, reviewedAt);
    this.replaceSubmission(updated.submission);
    this.replaceProgress(updated.progress);
    this.syncTeamCounts(updated.submission.teamId);
    this.writeAudit("submission_approved", updated.submission, reviewedAt);

    const review = await this.buildReview(updated.submission);
    return review ? { status: "updated", review } : { status: "not_found" };
  }

  async rejectSubmission(
    input: RejectSubmissionInput
  ): Promise<AdminReviewActionResult> {
    const snapshot = this.playerRepository.snapshot();
    const submission = snapshot.submissions.find(
      (row) => row.id === input.submissionId
    );

    if (!submission) {
      return { status: "not_found" };
    }

    if (submission.status !== "pending") {
      return { status: "invalid_transition" };
    }

    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!progress) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    const updated = rejectSubmissionDomain(
      submission,
      progress,
      input.reason,
      reviewedAt,
      input.message
    );
    this.replaceSubmission(updated.submission);
    this.replaceProgress(updated.progress);
    this.syncTeamCounts(updated.submission.teamId);
    this.writeAudit("submission_rejected", updated.submission, reviewedAt);

    const review = await this.buildReview(updated.submission);
    return review ? { status: "updated", review } : { status: "not_found" };
  }

  async revealManualFragment(input: OverrideInput): Promise<AdminOverrideResult> {
    const team = this.playerRepository.getTeam(input.teamId);
    if (!team) {
      return { status: "not_found" };
    }

    const updated = revealManualFragment(team);
    this.playerRepository.replaceTeam(updated);
    this.appendOverrideAudit("manual_fragment_revealed", input.teamId, input);
    return { status: "updated" };
  }

  async hideManualFragment(input: OverrideInput): Promise<AdminOverrideResult> {
    const team = this.playerRepository.getTeam(input.teamId);
    if (!team) {
      return { status: "not_found" };
    }

    const updated = hideManualFragment(team);
    this.playerRepository.replaceTeam(updated);
    this.appendOverrideAudit("manual_fragment_hidden", input.teamId, input);
    return { status: "updated" };
  }

  async skipQuest(input: Required<OverrideInput>): Promise<AdminOverrideResult> {
    const context = this.getTeamQuestContext(input.teamId, input.questId);
    if (!context) {
      return { status: "not_found" };
    }

    try {
      const skipped = skipQuest(context.progress, new Date().toISOString(), input.reason);
      this.playerRepository.replaceProgress(skipped);
      this.appendOverrideAudit("quest_skipped", input.teamId, input);
      return { status: "updated" };
    } catch (error) {
      return invalidInput(error);
    }
  }

  async overrideBrokenQuest(
    input: Required<OverrideInput>
  ): Promise<AdminOverrideResult> {
    const context = this.getTeamQuestContext(input.teamId, input.questId);
    if (!context) {
      return { status: "not_found" };
    }

    try {
      const overridden = overrideBrokenQuest(
        context.team,
        context.progress,
        new Date().toISOString(),
        input.reason
      );
      this.playerRepository.replaceTeam(overridden.team);
      this.playerRepository.replaceProgress(overridden.progress);
      this.appendOverrideAudit("broken_quest_overridden", input.teamId, input);
      return { status: "updated" };
    } catch (error) {
      return invalidInput(error);
    }
  }

  async enterReplacementProof(
    input: ReplacementProofInput
  ): Promise<AdminOverrideResult> {
    const context = this.getTeamQuestContext(input.teamId, input.questId);
    if (!context) {
      return { status: "not_found" };
    }

    try {
      const createdAt = new Date().toISOString();
      const submission = createReplacementProofDraft(
        {
          id: this.playerRepository.createReplacementSubmissionId(),
          teamId: input.teamId,
          questId: input.questId,
          contributorName: input.contributorName,
          proofKind: input.proofKind,
          proofValue: input.proofValue,
          note: input.note,
          status: input.status
        },
        createdAt
      );
      this.playerRepository.addSubmission(submission);
      this.appendOverrideAudit("replacement_proof_entered", input.teamId, {
        teamId: input.teamId,
        questId: input.questId,
        reason: input.status
      }, submission.id);
      return { status: "updated" };
    } catch (error) {
      return invalidInput(error);
    }
  }

  snapshot(): LocalRuntimeSnapshot {
    return { ...this.playerRepository.snapshot(), auditLogs: this.auditLogs };
  }

  private buildPendingReviews(): readonly PendingSubmissionReview[] {
    const snapshot = this.playerRepository.snapshot();

    return snapshot.submissions
      .filter((submission) => submission.status === "pending")
      .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt))
      .flatMap((submission) => {
        const review = this.buildReviewFromSnapshot(submission, snapshot);
        return review ? [review] : [];
      });
  }

  private async buildReview(
    submission: Submission
  ): Promise<PendingSubmissionReview | null> {
    return this.buildReviewFromSnapshot(submission, this.playerRepository.snapshot());
  }

  private buildReviewFromSnapshot(
    submission: Submission,
    snapshot: PlayerRepositorySnapshot
  ): PendingSubmissionReview | null {
    const team = snapshot.teams.find((row) => row.id === submission.teamId);
    const quest = snapshot.quests.find((row) => row.id === submission.questId);
    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!team || !quest || !progress) {
      return null;
    }

    return {
      submission,
      team,
      quest,
      progress,
      map: calculateMapProgress(
        snapshot.progressRows.filter((row) => row.teamId === submission.teamId)
      )
    };
  }

  private replaceSubmission(submission: Submission): void {
    const snapshot = this.playerRepository.snapshot();
    this.reset({
      ...snapshot,
      submissions: snapshot.submissions.map((row) =>
        row.id === submission.id ? submission : row
      )
    });
  }

  private replaceProgress(progress: TeamQuestProgress): void {
    const snapshot = this.playerRepository.snapshot();
    this.reset({
      ...snapshot,
      progressRows: snapshot.progressRows.map((row) =>
        row.id === progress.id ? progress : row
      )
    });
  }

  private reset(snapshot: PlayerRepositorySnapshot): void {
    const auditLogs = this.auditLogs;
    Object.assign(this, new LocalRuntimeRepository({ ...snapshot, auditLogs }));
  }

  private writeAudit(
    action: "submission_approved" | "submission_rejected",
    submission: Submission,
    createdAt: string
  ): void {
    this.auditLogs = [
      ...this.auditLogs,
      createAuditLog({
        id: this.createAuditId(),
        actorType: "admin",
        action,
        teamId: submission.teamId,
        questId: submission.questId,
        submissionId: submission.id,
        createdAt
      })
    ];
  }

  private appendAudit(
    input: Omit<Parameters<typeof createAuditLog>[0], "id">
  ): void {
    this.auditLogs = [
      ...this.auditLogs,
      createAuditLog({ id: this.createAuditId(), ...input })
    ];
  }

  private appendOverrideAudit(
    action:
      | "manual_fragment_revealed"
      | "manual_fragment_hidden"
      | "quest_skipped"
      | "broken_quest_overridden"
      | "replacement_proof_entered",
    teamId: string,
    input: OverrideInput,
    submissionId?: string
  ): void {
    this.appendAudit({
      actorType: "admin",
      action,
      teamId,
      questId: input.questId ?? null,
      submissionId: submissionId ?? null,
      metadata: auditMetadata({ reason: input.reason ?? null }),
      createdAt: new Date().toISOString()
    });
  }

  private getTeamQuestContext(teamId: string, questId: string) {
    const snapshot = this.playerRepository.snapshot();
    const team = snapshot.teams.find((row) => row.id === teamId);
    const quest = snapshot.quests.find((row) => row.id === questId);
    const progress = snapshot.progressRows.find(
      (row) => row.teamId === teamId && row.questId === questId
    );

    return team && quest && progress ? { team, quest, progress } : null;
  }

  private syncTeamCounts(teamId: string): void {
    const snapshot = this.playerRepository.snapshot();
    const team = snapshot.teams.find((row) => row.id === teamId);

    const approvedCount = snapshot.progressRows.filter(
      (row) => row.teamId === teamId && row.status === "approved"
    ).length;
    this.playerRepository.replaceTeam({
      ...team!,
      completedQuestCount: Math.min(approvedCount, 25),
      mapProgressCount: Math.min(approvedCount, 21)
    });
  }

  private createAuditId(): string {
    return `audit-${(this.auditLogs.length + 1).toString().padStart(4, "0")}`;
  }
}

const invalidInput = (error: unknown): AdminOverrideResult => ({
  status: "invalid_input",
  error: String(error)
});
