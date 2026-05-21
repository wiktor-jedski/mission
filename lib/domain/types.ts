import type {
  ActorType,
  AuditAction,
  ProofKind,
  RejectionReason,
  SubmissionStatus,
  TeamQuestStatus
} from "./constants";

export type Team = {
  id: string;
  name: string;
  pinHash: string;
  mapProgressCount: number;
  completedQuestCount: number;
  createdAt: string;
};

export type Quest = {
  id: string;
  slug: string;
  title: string;
  flavorText: string;
  instructions: string;
  successCriteria: string;
  safetyWarning: string;
  proofKind: ProofKind;
  hintText: string | null;
  isActive: boolean;
};

export type TeamQuestProgress = {
  id: string;
  teamId: string;
  questId: string;
  status: TeamQuestStatus;
  hintUsedAt: string | null;
  approvedAt: string | null;
  skippedAt: string | null;
};

export type Submission = {
  id: string;
  teamId: string;
  questId: string;
  contributorName: string;
  proofKind: ProofKind;
  proofValue: string;
  note: string | null;
  status: SubmissionStatus;
  rejectionReason: RejectionReason | null;
  rejectionMessage: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

export type AuditLog = {
  id: string;
  actorType: ActorType;
  actorId: string | null;
  action: AuditAction;
  teamId: string | null;
  questId: string | null;
  submissionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AppSettings = {
  requiredApprovalCount: number;
  isPaused: boolean;
};

export type MapProgressSnapshot = {
  approvedQuestCount: number;
  revealedFragmentCount: number;
  requiredApprovalCount: number;
  isFinalUnlocked: boolean;
};
