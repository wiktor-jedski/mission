import { describe, expect, it } from "vitest";
import {
  MAX_CONTRIBUTOR_LENGTH,
  MAX_NOTE_LENGTH,
  proofInputLabel,
  validateSubmissionForm
} from "@/lib/player/submission-form";

describe("submission form validation", () => {
  it("accepts URL proofs and trims optional notes", () => {
    expect(
      validateSubmissionForm(
        {
          contributorName: " Ala ",
          proofValue: " https://example.com/photo ",
          note: " gotowe "
        },
        "photo_link"
      )
    ).toEqual({
      valid: true,
      data: {
        contributorName: "Ala",
        proofValue: "https://example.com/photo",
        note: "gotowe"
      }
    });
  });

  it("accepts text proofs and turns blank notes into null", () => {
    expect(
      validateSubmissionForm(
        {
          contributorName: "Ola",
          proofValue: " odpowiedz ",
          note: " "
        },
        "text_response"
      )
    ).toEqual({
      valid: true,
      data: { contributorName: "Ola", proofValue: "odpowiedz", note: null }
    });
  });

  it("reports missing contributor, missing proof, invalid URL, and length errors", () => {
    expect(
      validateSubmissionForm(
        { contributorName: " ", proofValue: " ", note: "" },
        "text_response"
      )
    ).toEqual({
      valid: false,
      errors: {
        contributorName: "Podaj imie osoby dodajacej dowod.",
        proofValue: "Wpisz odpowiedz tekstowa."
      }
    });

    expect(
      validateSubmissionForm(
        {
          contributorName: "Ala",
          proofValue: "not a url",
          note: ""
        },
        "audio_link"
      )
    ).toEqual({
      valid: false,
      errors: { proofValue: "Link musi zaczynac sie od http:// albo https://." }
    });

    expect(
      validateSubmissionForm(
        {
          contributorName: "A".repeat(MAX_CONTRIBUTOR_LENGTH + 1),
          proofValue: "",
          note: "N".repeat(MAX_NOTE_LENGTH + 1)
        },
        "video_link"
      )
    ).toEqual({
      valid: false,
      errors: {
        contributorName: "Imie jest za dlugie.",
        proofValue: "Wklej link do dowodu.",
        note: "Notatka jest za dluga."
      }
    });
  });

  it("returns labels for every proof kind", () => {
    expect(proofInputLabel("photo_link")).toBe("Link do zdjęcia");
    expect(proofInputLabel("video_link")).toBe("Link do filmu");
    expect(proofInputLabel("audio_link")).toBe("Link do nagrania audio");
    expect(proofInputLabel("text_response")).toBe("Odpowiedź tekstowa");
  });
});
