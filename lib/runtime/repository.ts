import type {
  AuditLog,
  MapProgressSnapshot,
  Quest,
  Submission,
  Team,
  TeamQuestProgress
} from "@/lib/domain/types";

export type QuestAccessResult =
  | {
      status: "found";
      quest: Quest;
      progress: TeamQuestProgress;
      submissions: readonly Submission[];
    }
  | { status: "not_found" };

export type SubmitProofInput = {
  teamId: string;
  questSlug: string;
  contributorName: string;
  proofValue: string;
  note: string | null;
};

export type SubmitProofResult =
  | { status: "created"; submission: Submission; progress: TeamQuestProgress }
  | { status: "quest_not_found" }
  | { status: "blocked"; reason: "already_approved" | "active_submission" };

export type PendingSubmissionReview = {
  submission: Submission;
  team: Team;
  quest: Quest;
  progress: TeamQuestProgress;
  map: MapProgressSnapshot;
};

export type AdminReviewActionResult =
  | { status: "updated"; review: PendingSubmissionReview }
  | { status: "not_found" }
  | { status: "invalid_transition" };

export type AdminOverrideResult =
  | { status: "updated" }
  | { status: "not_found" }
  | { status: "invalid_input"; error: string };

export type RejectSubmissionInput = {
  submissionId: string;
  reason: string;
  message: string | null;
};

export type HintUsageResult =
  | { status: "updated"; progress: TeamQuestProgress }
  | { status: "not_found" }
  | { status: "no_hint" };

export type AuditLogEntry = {
  audit: AuditLog;
  team: Team | null;
  quest: Quest | null;
  submission: Submission | null;
};

export type OverrideInput = {
  teamId: string;
  questId?: string;
  reason?: string;
};

export type ReplacementProofInput = {
  teamId: string;
  questId: string;
  contributorName: string;
  proofKind: string;
  proofValue: string;
  note: string | null;
  status: "pending" | "approved";
};

export type RuntimeRepository = {
  getTeams(): Promise<readonly Team[]>;
  getTeam(teamId: string): Promise<Team | null>;
  getQuests(): Promise<readonly Quest[]>;
  getQuestBySlug(slug: string): Promise<Quest | null>;
  getQuestAccess(teamId: string, slug: string): Promise<QuestAccessResult>;
  recordTeamLogin(teamId: string): Promise<void>;
  recordQuestView(teamId: string, questId: string): Promise<void>;
  getTeamSubmissions(teamId: string): Promise<readonly Submission[]>;
  submitProof(input: SubmitProofInput): Promise<SubmitProofResult>;
  useHint(teamId: string, questSlug: string): Promise<HintUsageResult>;
  getTeamMapState(teamId: string): Promise<MapProgressSnapshot>;
  listAuditLogs(limit?: number): Promise<readonly AuditLogEntry[]>;
  listPendingSubmissions(): Promise<readonly PendingSubmissionReview[]>;
  getPendingSubmission(
    submissionId: string
  ): Promise<PendingSubmissionReview | null>;
  approveSubmission(submissionId: string): Promise<AdminReviewActionResult>;
  rejectSubmission(
    input: RejectSubmissionInput
  ): Promise<AdminReviewActionResult>;
  revealManualFragment(input: OverrideInput): Promise<AdminOverrideResult>;
  hideManualFragment(input: OverrideInput): Promise<AdminOverrideResult>;
  skipQuest(input: Required<OverrideInput>): Promise<AdminOverrideResult>;
  overrideBrokenQuest(input: Required<OverrideInput>): Promise<AdminOverrideResult>;
  enterReplacementProof(input: ReplacementProofInput): Promise<AdminOverrideResult>;
};
