import { describe, expect, it } from "vitest";
import type { Submission, TeamQuestProgress } from "@/lib/domain/types";
import { phase1Quests } from "@/lib/seed/phase1";
import {
  buildQuestViewModel,
  buildSubmissionStatusViews
} from "@/lib/player/view-models";

const quest = phase1Quests[0];

describe("player view models", () => {
  it("builds not-started, pending, approved, and rejected quest states", () => {
    expect(buildQuestViewModel(quest, progress(), [])).toMatchObject({
      title: quest.title,
      proofLabel: "Link do zdjęcia",
      statusMessage: "Misja gotowa do wykonania.",
      canSubmit: true,
      latestRejectionMessage: null
    });
    expect(
      buildQuestViewModel(quest, progress({ status: "pending_review" }), [
        submission({ status: "pending" })
      ])
    ).toMatchObject({
      statusMessage: "Dowod czeka na sprawdzenie.",
      canSubmit: false
    });
    expect(
      buildQuestViewModel(quest, progress({ status: "approved" }), [
        submission({ status: "approved" })
      ])
    ).toMatchObject({
      statusMessage: "Misja zaakceptowana.",
      canSubmit: false
    });
    expect(
      buildQuestViewModel(quest, progress({ status: "rejected" }), [
        submission({
          status: "rejected",
          rejectionMessage: "Popraw link"
        })
      ])
    ).toMatchObject({
      statusMessage: "Dowod odrzucony. Mozecie wyslac nowy.",
      canSubmit: true,
      latestRejectionMessage: "Popraw link"
    });
  });

  it("treats approved progress as final even without active submission", () => {
    expect(
      buildQuestViewModel(quest, progress({ status: "approved" }), [])
    ).toMatchObject({
      statusMessage: "Misja zaakceptowana.",
      canSubmit: false
    });
  });

  it("tracks hint usage without inventing missing hint text", () => {
    expect(
      buildQuestViewModel(
        { ...quest, hintText: null },
        progress({ hintUsedAt: "2026-05-21T10:00:00.000Z" }),
        []
      )
    ).toMatchObject({ hintUsed: true, hintText: null });
  });

  it("builds team-scoped submission status rows without proof values", () => {
    expect(
      buildSubmissionStatusViews(
        [
          submission({ id: "pending", status: "pending" }),
          submission({ id: "approved", status: "approved" }),
          submission({
            id: "rejected",
            status: "rejected",
            rejectionMessage: "Jeszcze raz"
          }),
          submission({ id: "unknown", questId: "missing" })
        ],
        [quest]
      )
    ).toEqual([
      {
        id: "pending",
        questTitle: quest.title,
        contributorName: "Ala",
        statusLabel: "Czeka na sprawdzenie",
        rejectionMessage: null
      },
      {
        id: "approved",
        questTitle: quest.title,
        contributorName: "Ala",
        statusLabel: "Zaakceptowane",
        rejectionMessage: null
      },
      {
        id: "rejected",
        questTitle: quest.title,
        contributorName: "Ala",
        statusLabel: "Odrzucone",
        rejectionMessage: "Jeszcze raz"
      },
      {
        id: "unknown",
        questTitle: "Nieznana misja",
        contributorName: "Ala",
        statusLabel: "Czeka na sprawdzenie",
        rejectionMessage: null
      }
    ]);
  });
});

const progress = (
  overrides: Partial<TeamQuestProgress> = {}
): TeamQuestProgress => ({
  id: "team-ember-quest-01",
  teamId: "team-ember",
  questId: quest.id,
  status: "not_started",
  hintUsedAt: null,
  approvedAt: null,
  skippedAt: null,
  ...overrides
});

const submission = (overrides: Partial<Submission> = {}): Submission => ({
  id: "submission-01",
  teamId: "team-ember",
  questId: quest.id,
  contributorName: "Ala",
  proofKind: quest.proofKind,
  proofValue: "https://example.com/photo",
  note: null,
  status: "pending",
  rejectionReason: null,
  rejectionMessage: null,
  submittedAt: "2026-05-21T10:00:00.000Z",
  reviewedAt: null,
  ...overrides
});
