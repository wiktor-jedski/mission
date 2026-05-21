import type { Quest, Submission, TeamQuestProgress } from "@/lib/domain/types";
import { proofInputLabel } from "@/lib/player/submission-form";

export type QuestViewModel = {
  slug: string;
  title: string;
  flavorText: string;
  instructions: string;
  successCriteria: string;
  safetyWarning: string;
  proofLabel: string;
  statusMessage: string;
  canSubmit: boolean;
  latestRejectionMessage: string | null;
};

export type SubmissionStatusView = {
  id: string;
  questTitle: string;
  contributorName: string;
  statusLabel: string;
  rejectionMessage: string | null;
};

export const buildQuestViewModel = (
  quest: Quest,
  progress: TeamQuestProgress,
  submissions: readonly Submission[]
): QuestViewModel => {
  const latestSubmission = submissions[0] ?? null;
  const activeSubmission = submissions.find(
    (submission) =>
      submission.status === "pending" || submission.status === "approved"
  );
  const canSubmit = !activeSubmission && progress.status !== "approved";

  return {
    slug: quest.slug,
    title: quest.title,
    flavorText: quest.flavorText,
    instructions: quest.instructions,
    successCriteria: quest.successCriteria,
    safetyWarning: quest.safetyWarning,
    proofLabel: proofInputLabel(quest.proofKind),
    statusMessage: statusMessage(progress, activeSubmission, latestSubmission),
    canSubmit,
    latestRejectionMessage:
      latestSubmission?.status === "rejected"
        ? latestSubmission.rejectionMessage
        : null
  };
};

export const buildSubmissionStatusViews = (
  submissions: readonly Submission[],
  quests: readonly Quest[]
): readonly SubmissionStatusView[] =>
  submissions.map((submission) => ({
    id: submission.id,
    questTitle:
      quests.find((quest) => quest.id === submission.questId)?.title ??
      "Nieznana misja",
    contributorName: submission.contributorName,
    statusLabel: submissionStatusLabel(submission.status),
    rejectionMessage:
      submission.status === "rejected" ? submission.rejectionMessage : null
  }));

const statusMessage = (
  progress: TeamQuestProgress,
  activeSubmission: Submission | undefined,
  latestSubmission: Submission | null
): string => {
  if (activeSubmission?.status === "pending") {
    return "Dowod czeka na sprawdzenie.";
  }

  if (activeSubmission?.status === "approved" || progress.status === "approved") {
    return "Misja zaakceptowana.";
  }

  if (latestSubmission?.status === "rejected" || progress.status === "rejected") {
    return "Dowod odrzucony. Mozecie wyslac nowy.";
  }

  return "Misja gotowa do wykonania.";
};

const submissionStatusLabel = (status: Submission["status"]): string => {
  switch (status) {
    case "pending":
      return "Czeka na sprawdzenie";
    case "approved":
      return "Zaakceptowane";
    case "rejected":
      return "Odrzucone";
  }
};
