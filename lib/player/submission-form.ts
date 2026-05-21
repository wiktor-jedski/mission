import type { ProofKind } from "@/lib/domain/constants";

export type SubmissionFormInput = {
  contributorName: string;
  proofValue: string;
  note: string;
};

export type SubmissionFormData = {
  contributorName: string;
  proofValue: string;
  note: string | null;
};

export type SubmissionFormErrors = Partial<
  Record<keyof SubmissionFormInput, string>
>;

export type SubmissionValidationResult =
  | { valid: true; data: SubmissionFormData }
  | { valid: false; errors: SubmissionFormErrors };

export const MAX_CONTRIBUTOR_LENGTH = 80;
export const MAX_NOTE_LENGTH = 500;

export const validateSubmissionForm = (
  input: SubmissionFormInput,
  proofKind: ProofKind
): SubmissionValidationResult => {
  const contributorName = input.contributorName.trim();
  const proofValue = input.proofValue.trim();
  const note = input.note.trim();
  const errors: SubmissionFormErrors = {};

  if (!contributorName) {
    errors.contributorName = "Podaj imie osoby dodajacej dowod.";
  } else if (contributorName.length > MAX_CONTRIBUTOR_LENGTH) {
    errors.contributorName = "Imie jest za dlugie.";
  }

  if (!proofValue) {
    errors.proofValue =
      proofKind === "text_response"
        ? "Wpisz odpowiedz tekstowa."
        : "Wklej link do dowodu.";
  } else if (proofKind !== "text_response" && !isHttpUrl(proofValue)) {
    errors.proofValue = "Link musi zaczynac sie od http:// albo https://.";
  }

  if (note.length > MAX_NOTE_LENGTH) {
    errors.note = "Notatka jest za dluga.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      contributorName,
      proofValue,
      note: note || null
    }
  };
};

export const proofInputLabel = (proofKind: ProofKind): string => {
  switch (proofKind) {
    case "photo_link":
      return "Link do zdjecia";
    case "video_link":
      return "Link do filmu";
    case "audio_link":
      return "Link do nagrania audio";
    case "text_response":
      return "Odpowiedz tekstowa";
  }
};

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
