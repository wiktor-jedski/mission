import type {
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

export type RejectSubmissionInput = {
  submissionId: string;
  reason: string;
  message: string | null;
};

export type RuntimeRepository = {
  getTeams(): Promise<readonly Team[]>;
  getTeam(teamId: string): Promise<Team | null>;
  getQuests(): Promise<readonly Quest[]>;
  getQuestBySlug(slug: string): Promise<Quest | null>;
  getQuestAccess(teamId: string, slug: string): Promise<QuestAccessResult>;
  getTeamSubmissions(teamId: string): Promise<readonly Submission[]>;
  submitProof(input: SubmitProofInput): Promise<SubmitProofResult>;
  getTeamMapState(teamId: string): Promise<MapProgressSnapshot>;
  listPendingSubmissions(): Promise<readonly PendingSubmissionReview[]>;
  getPendingSubmission(
    submissionId: string
  ): Promise<PendingSubmissionReview | null>;
  approveSubmission(submissionId: string): Promise<AdminReviewActionResult>;
  rejectSubmission(
    input: RejectSubmissionInput
  ): Promise<AdminReviewActionResult>;
};
