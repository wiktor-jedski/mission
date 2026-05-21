import {
  isProofKind,
  isRejectionReason,
  REQUIRED_APPROVAL_COUNT
} from "./constants";
import type {
  ActorType,
  AuditAction,
  ProofKind,
  RejectionReason
} from "./constants";
import type {
  AuditLog,
  MapProgressSnapshot,
  Submission,
  TeamQuestProgress
} from "./types";

type SubmissionInput = {
  id: string;
  teamId: string;
  questId: string;
  contributorName: string;
  proofKind: string;
  proofValue: string;
  note?: string | null;
};

type AuditInput = {
  id: string;
  actorType: ActorType;
  actorId?: string | null;
  action: AuditAction;
  teamId?: string | null;
  questId?: string | null;
  submissionId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export const calculateMapProgress = (
  progressRows: readonly TeamQuestProgress[],
  requiredApprovalCount = REQUIRED_APPROVAL_COUNT
): MapProgressSnapshot => {
  if (requiredApprovalCount < 1) {
    throw new Error("Required approval count must be positive.");
  }

  const approvedQuestCount = progressRows.filter(
    (progress) => progress.status === "approved"
  ).length;
  const revealedFragmentCount = Math.min(
    approvedQuestCount,
    requiredApprovalCount
  );

  return {
    approvedQuestCount,
    revealedFragmentCount,
    requiredApprovalCount,
    isFinalUnlocked: approvedQuestCount >= requiredApprovalCount
  };
};

export const canSubmitProof = (
  teamId: string,
  questId: string,
  submissions: readonly Submission[],
  progressRows: readonly TeamQuestProgress[]
):
  | { allowed: true }
  | { allowed: false; reason: "already_approved" | "active_submission" } => {
  const progress = progressRows.find(
    (row) => row.teamId === teamId && row.questId === questId
  );

  if (progress?.status === "approved") {
    return { allowed: false, reason: "already_approved" };
  }

  const hasActiveSubmission = submissions.some(
    (submission) =>
      submission.teamId === teamId &&
      submission.questId === questId &&
      (submission.status === "pending" || submission.status === "approved")
  );

  if (hasActiveSubmission) {
    return { allowed: false, reason: "active_submission" };
  }

  return { allowed: true };
};

export const createSubmissionDraft = (
  input: SubmissionInput,
  progress: TeamQuestProgress,
  submittedAt: string
): { submission: Submission; progress: TeamQuestProgress } => {
  const contributorName = input.contributorName.trim();
  const proofValue = input.proofValue.trim();
  const note = input.note?.trim() || null;

  if (!contributorName) {
    throw new Error("Contributor name is required.");
  }

  if (!proofValue) {
    throw new Error("Proof value is required.");
  }

  if (!isProofKind(input.proofKind)) {
    throw new Error("Proof kind is invalid.");
  }

  if (input.proofKind !== "text_response" && !isValidUrl(proofValue)) {
    throw new Error("Proof link must be a valid URL.");
  }

  return {
    submission: {
      id: input.id,
      teamId: input.teamId,
      questId: input.questId,
      contributorName,
      proofKind: input.proofKind,
      proofValue,
      note,
      status: "pending",
      rejectionReason: null,
      rejectionMessage: null,
      submittedAt,
      reviewedAt: null
    },
    progress: {
      ...progress,
      status: "pending_review",
      approvedAt: null,
      skippedAt: null
    }
  };
};

export const rejectSubmission = (
  submission: Submission,
  progress: TeamQuestProgress,
  reason: string,
  reviewedAt: string,
  rejectionMessage?: string | null
): { submission: Submission; progress: TeamQuestProgress } => {
  if (submission.status !== "pending") {
    throw new Error("Only pending submissions can be rejected.");
  }

  if (!isRejectionReason(reason)) {
    throw new Error("Rejection reason is invalid.");
  }

  return {
    submission: {
      ...submission,
      status: "rejected",
      rejectionReason: reason,
      rejectionMessage: rejectionMessage?.trim() || null,
      reviewedAt
    },
    progress: {
      ...progress,
      status: "rejected",
      approvedAt: null,
      skippedAt: null
    }
  };
};

export const approveSubmission = (
  submission: Submission,
  progress: TeamQuestProgress,
  reviewedAt: string
): {
  submission: Submission;
  progress: TeamQuestProgress;
  newlyApproved: boolean;
} => {
  if (submission.status === "approved") {
    return {
      submission,
      progress,
      newlyApproved: false
    };
  }

  if (submission.status !== "pending") {
    throw new Error("Only pending submissions can be approved.");
  }

  const newlyApproved = progress.status !== "approved";

  return {
    submission: {
      ...submission,
      status: "approved",
      rejectionReason: null,
      rejectionMessage: null,
      reviewedAt
    },
    progress: {
      ...progress,
      status: "approved",
      approvedAt: progress.approvedAt ?? reviewedAt,
      skippedAt: null
    },
    newlyApproved
  };
};

export const createAuditLog = (input: AuditInput): AuditLog => ({
  id: input.id,
  actorType: input.actorType,
  actorId: input.actorId ?? null,
  action: input.action,
  teamId: input.teamId ?? null,
  questId: input.questId ?? null,
  submissionId: input.submissionId ?? null,
  metadata: input.metadata ?? {},
  createdAt: input.createdAt
});

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export type { ProofKind, RejectionReason };
