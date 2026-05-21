import { isProofKind } from "@/lib/domain/constants";

export const OVERRIDE_REASON_MAX_LENGTH = 300;
export const REPLACEMENT_NOTE_MAX_LENGTH = 500;

export type OverrideActionInput =
  | { action: "reveal"; teamId: string }
  | { action: "hide"; teamId: string; reason: string }
  | { action: "skip"; teamId: string; questId: string; reason: string }
  | { action: "override"; teamId: string; questId: string; reason: string }
  | {
      action: "replacement";
      teamId: string;
      questId: string;
      contributorName: string;
      proofKind: string;
      proofValue: string;
      note: string | null;
      status: "pending" | "approved";
    };

export type OverrideActionValidation =
  | { valid: true; data: OverrideActionInput }
  | { valid: false; error: string };

export const validateOverrideAction = (
  raw: Record<string, string | null>
): OverrideActionValidation => {
  const action = raw.action?.trim();
  const teamId = raw.teamId?.trim() ?? "";
  const questId = raw.questId?.trim() ?? "";
  const reason = raw.reason?.trim() ?? "";

  if (!isSafeId(teamId)) {
    return { valid: false, error: "Nieprawidlowa druzyna." };
  }

  if (action === "reveal") {
    return { valid: true, data: { action, teamId } };
  }

  if (action === "hide") {
    const validReason = validateReason(reason);
    return validReason.valid
      ? { valid: true, data: { action, teamId, reason } }
      : validReason;
  }

  if (action === "skip" || action === "override") {
    if (!isSafeId(questId)) {
      return { valid: false, error: "Nieprawidlowa misja." };
    }

    const validReason = validateReason(reason);
    return validReason.valid
      ? { valid: true, data: { action, teamId, questId, reason } }
      : validReason;
  }

  if (action !== "replacement") {
    return { valid: false, error: "Nieznana akcja." };
  }

  if (!isSafeId(questId)) {
    return { valid: false, error: "Nieprawidlowa misja." };
  }

  const contributorName = raw.contributorName?.trim() ?? "";
  const proofKind = raw.proofKind?.trim() ?? "";
  const proofValue = raw.proofValue?.trim() ?? "";
  const status = raw.status?.trim();
  const note = raw.note?.trim() || null;

  if (!contributorName) {
    return { valid: false, error: "Podaj autora dowodu." };
  }

  if (!isProofKind(proofKind)) {
    return { valid: false, error: "Wybierz typ dowodu." };
  }

  if (!proofValue) {
    return { valid: false, error: "Podaj dowod." };
  }

  if (proofKind !== "text_response" && !isHttpUrl(proofValue)) {
    return { valid: false, error: "Dowod musi byc linkiem HTTP." };
  }

  if (note && note.length > REPLACEMENT_NOTE_MAX_LENGTH) {
    return { valid: false, error: "Notatka jest za dluga." };
  }

  if (status !== "pending" && status !== "approved") {
    return { valid: false, error: "Wybierz status dowodu." };
  }

  return {
    valid: true,
    data: {
      action,
      teamId,
      questId,
      contributorName,
      proofKind,
      proofValue,
      note,
      status
    }
  };
};

const validateReason = (
  reason: string
): OverrideActionValidation | { valid: true } => {
  if (!reason) {
    return { valid: false, error: "Podaj powod." };
  }

  if (reason.length > OVERRIDE_REASON_MAX_LENGTH) {
    return { valid: false, error: "Powod jest za dlugi." };
  }

  return { valid: true };
};

const isSafeId = (value: string): boolean =>
  /^[a-zA-Z0-9_-]{1,120}$/.test(value);

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};
