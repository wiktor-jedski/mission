import { describe, expect, it } from "vitest";
import {
  approveSubmission,
  calculateMapProgress,
  canSubmitProof,
  createAuditLog,
  createSubmissionDraft,
  rejectSubmission
} from "@/lib/domain/game";
import type { Submission, TeamQuestProgress } from "@/lib/domain/types";

const now = "2026-05-21T10:00:00.000Z";
const later = "2026-05-21T11:00:00.000Z";

const progress = (
  overrides: Partial<TeamQuestProgress> = {}
): TeamQuestProgress => ({
  id: "team-ember-quest-01",
  teamId: "team-ember",
  questId: "quest-01",
  status: "not_started",
  hintUsedAt: null,
  approvedAt: null,
  skippedAt: null,
  ...overrides
});

const submission = (overrides: Partial<Submission> = {}): Submission => ({
  id: "submission-01",
  teamId: "team-ember",
  questId: "quest-01",
  contributorName: "Ala",
  proofKind: "photo_link",
  proofValue: "https://example.com/photo",
  note: null,
  status: "pending",
  rejectionReason: null,
  rejectionMessage: null,
  submittedAt: now,
  reviewedAt: null,
  ...overrides
});

describe("calculateMapProgress", () => {
  it("calculates empty, partial, final, and capped reveal states", () => {
    expect(calculateMapProgress([])).toEqual({
      approvedQuestCount: 0,
      revealedFragmentCount: 0,
      requiredApprovalCount: 21,
      isFinalUnlocked: false
    });

    expect(
      calculateMapProgress([
        progress({ id: "one", status: "approved" }),
        progress({ id: "two", status: "pending_review" }),
        progress({ id: "three", status: "rejected" }),
        progress({ id: "four", status: "skipped" }),
        progress({ id: "five", status: "not_started" })
      ]).revealedFragmentCount
    ).toBe(1);

    expect(
      calculateMapProgress(
        Array.from({ length: 21 }, (_, index) =>
          progress({ id: `approved-${index}`, status: "approved" })
        )
      ).isFinalUnlocked
    ).toBe(true);

    expect(
      calculateMapProgress(
        Array.from({ length: 25 }, (_, index) =>
          progress({ id: `approved-${index}`, status: "approved" })
        )
      )
    ).toMatchObject({
      approvedQuestCount: 25,
      revealedFragmentCount: 21,
      isFinalUnlocked: true
    });
  });

  it("rejects impossible required approval counts", () => {
    expect(() => calculateMapProgress([], 0)).toThrow(
      "Required approval count must be positive."
    );
  });
});

describe("canSubmitProof", () => {
  it("allows a team to submit when there is no active submission", () => {
    expect(
      canSubmitProof(
        "team-ember",
        "quest-01",
        [submission({ status: "rejected" })],
        [progress({ status: "rejected" })]
      )
    ).toEqual({ allowed: true });
  });

  it("blocks duplicate pending and approved submissions only for the same team quest", () => {
    expect(
      canSubmitProof("team-ember", "quest-01", [submission()], [progress()])
    ).toEqual({ allowed: false, reason: "active_submission" });
    expect(
      canSubmitProof(
        "team-ember",
        "quest-01",
        [
          submission({ teamId: "team-iron" }),
          submission({ questId: "quest-02" }),
          submission({ status: "approved" })
        ],
        [progress()]
      )
    ).toEqual({ allowed: false, reason: "active_submission" });
  });

  it("blocks submissions for already approved progress", () => {
    expect(
      canSubmitProof("team-ember", "quest-01", [], [
        progress({ status: "approved" })
      ])
    ).toEqual({ allowed: false, reason: "already_approved" });
  });
});

describe("submission transitions", () => {
  it("creates pending submissions for URL and text proof", () => {
    const created = createSubmissionDraft(
      {
        id: "submission-02",
        teamId: "team-ember",
        questId: "quest-01",
        contributorName: " Ala ",
        proofKind: "photo_link",
        proofValue: " https://example.com/photo ",
        note: " gotowe "
      },
      progress({ status: "rejected", skippedAt: later }),
      now
    );

    expect(created.submission).toMatchObject({
      contributorName: "Ala",
      proofKind: "photo_link",
      proofValue: "https://example.com/photo",
      note: "gotowe",
      status: "pending",
      reviewedAt: null
    });
    expect(created.progress).toMatchObject({
      status: "pending_review",
      approvedAt: null,
      skippedAt: null
    });

    expect(
      createSubmissionDraft(
        {
          id: "submission-03",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ola",
          proofKind: "text_response",
          proofValue: "odpowiedz"
        },
        progress(),
        now
      ).submission.note
    ).toBeNull();
  });

  it("accepts http links and rejects invalid submission input", () => {
    expect(
      createSubmissionDraft(
        {
          id: "submission-04",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "audio_link",
          proofValue: "http://example.com/audio"
        },
        progress(),
        now
      ).submission.proofValue
    ).toBe("http://example.com/audio");
    expect(() =>
      createSubmissionDraft(
        {
          id: "bad",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: " ",
          proofKind: "photo_link",
          proofValue: "https://example.com"
        },
        progress(),
        now
      )
    ).toThrow("Contributor name is required.");
    expect(() =>
      createSubmissionDraft(
        {
          id: "bad",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "photo_link",
          proofValue: " "
        },
        progress(),
        now
      )
    ).toThrow("Proof value is required.");
    expect(() =>
      createSubmissionDraft(
        {
          id: "bad",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "upload",
          proofValue: "https://example.com"
        },
        progress(),
        now
      )
    ).toThrow("Proof kind is invalid.");
    expect(() =>
      createSubmissionDraft(
        {
          id: "bad",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "photo_link",
          proofValue: "ftp://example.com"
        },
        progress(),
        now
      )
    ).toThrow("Proof link must be a valid URL.");
    expect(() =>
      createSubmissionDraft(
        {
          id: "bad",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "photo_link",
          proofValue: "not a url"
        },
        progress(),
        now
      )
    ).toThrow("Proof link must be a valid URL.");
  });

  it("rejects submissions with every reason and allows resubmission", () => {
    const reasons = [
      "link_inaccessible",
      "wrong_proof",
      "quest_incomplete",
      "other"
    ] as const;

    for (const reason of reasons) {
      const rejected = rejectSubmission(
        submission(),
        progress({ status: "pending_review" }),
        reason,
        later,
        " popraw "
      );
      expect(rejected.submission).toMatchObject({
        status: "rejected",
        rejectionReason: reason,
        rejectionMessage: "popraw",
        reviewedAt: later
      });
      expect(rejected.progress).toMatchObject({
        status: "rejected",
        approvedAt: null,
        skippedAt: null
      });
      expect(
        canSubmitProof(
          rejected.submission.teamId,
          rejected.submission.questId,
          [rejected.submission],
          [rejected.progress]
        )
      ).toEqual({ allowed: true });
    }

    expect(
      rejectSubmission(
        submission(),
        progress({ status: "pending_review" }),
        "other",
        later
      ).submission.rejectionMessage
    ).toBeNull();
    expect(() =>
      rejectSubmission(
        submission(),
        progress({ status: "pending_review" }),
        "unclear",
        later
      )
    ).toThrow("Rejection reason is invalid.");
  });

  it("approves submissions idempotently", () => {
    const approved = approveSubmission(
      submission({ status: "pending" }),
      progress({ status: "pending_review" }),
      later
    );
    expect(approved).toMatchObject({
      newlyApproved: true,
      submission: {
        status: "approved",
        rejectionReason: null,
        rejectionMessage: null,
        reviewedAt: later
      },
      progress: { status: "approved", approvedAt: later, skippedAt: null }
    });

    const duplicate = approveSubmission(
      approved.submission,
      approved.progress,
      "2026-05-21T12:00:00.000Z"
    );
    expect(duplicate.newlyApproved).toBe(false);
    expect(duplicate.progress.approvedAt).toBe(later);

    const afterResubmission = approveSubmission(
      submission({ status: "pending", rejectionReason: null }),
      progress({ status: "rejected" }),
      later
    );
    expect(afterResubmission.newlyApproved).toBe(true);
  });
});

describe("createAuditLog", () => {
  it("creates full and minimal audit records", () => {
    expect(
      createAuditLog({
        id: "audit-01",
        actorType: "admin",
        actorId: "admin",
        action: "submission_approved",
        teamId: "team-ember",
        questId: "quest-01",
        submissionId: "submission-01",
        metadata: { approved: true },
        createdAt: now
      })
    ).toEqual({
      id: "audit-01",
      actorType: "admin",
      actorId: "admin",
      action: "submission_approved",
      teamId: "team-ember",
      questId: "quest-01",
      submissionId: "submission-01",
      metadata: { approved: true },
      createdAt: now
    });

    expect(
      createAuditLog({
        id: "audit-02",
        actorType: "system",
        action: "seed_validated",
        createdAt: now
      })
    ).toMatchObject({
      actorId: null,
      teamId: null,
      questId: null,
      submissionId: null,
      metadata: {}
    });
  });
});
