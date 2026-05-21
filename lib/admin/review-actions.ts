import { isRejectionReason } from "@/lib/domain/constants";

export const REJECTION_MESSAGE_MAX_LENGTH = 500;

export type ReviewActionInput =
  | { action: "approve"; submissionId: string }
  | {
      action: "reject";
      submissionId: string;
      reason: string;
      message: string | null;
    };

export type ReviewActionValidation =
  | { valid: true; data: ReviewActionInput }
  | { valid: false; error: string };

export const validateReviewAction = (
  raw: Record<string, string | null>
): ReviewActionValidation => {
  const action = raw.action?.trim();
  const submissionId = raw.submissionId?.trim() ?? "";

  if (!isSafeSubmissionId(submissionId)) {
    return { valid: false, error: "Nieprawidlowe zgloszenie." };
  }

  if (action === "approve") {
    return { valid: true, data: { action, submissionId } };
  }

  if (action !== "reject") {
    return { valid: false, error: "Nieznana akcja." };
  }

  const reason = raw.reason?.trim() ?? "";

  if (!isRejectionReason(reason)) {
    return { valid: false, error: "Wybierz powod odrzucenia." };
  }

  const message = raw.message?.trim() || null;

  if (message && message.length > REJECTION_MESSAGE_MAX_LENGTH) {
    return { valid: false, error: "Wiadomosc jest za dluga." };
  }

  return { valid: true, data: { action, submissionId, reason, message } };
};

const isSafeSubmissionId = (value: string): boolean =>
  /^[a-zA-Z0-9_-]{1,120}$/.test(value);
