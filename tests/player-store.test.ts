import { describe, expect, it } from "vitest";
import type { Quest, Submission } from "@/lib/domain/types";
import { phase1Quests, phase1TeamQuestProgress, phase1Teams } from "@/lib/seed/phase1";
import {
  getPlayerRepository,
  PlayerRepository,
  resetPlayerRepositoryForTests
} from "@/lib/player/store";

const firstQuest = phase1Quests[0];
const secondQuest = phase1Quests[1];

describe("PlayerRepository", () => {
  it("returns teams and active quests by safe slug only", () => {
    const repository = new PlayerRepository();

    expect(repository.getTeams()).toHaveLength(2);
    expect(repository.getTeam("team-ember")?.name).toBe("Druzyna Zarzewia");
    expect(repository.getTeam("missing")).toBeNull();
    expect(repository.getQuestBySlug(firstQuest.slug)?.id).toBe(firstQuest.id);
    expect(repository.getQuestBySlug("../secret")).toBeNull();
  });

  it("returns not_found for inactive, malformed, unknown, or unknown-team quest access", () => {
    const inactiveQuest: Quest = { ...firstQuest, isActive: false };
    const repository = new PlayerRepository({
      teams: phase1Teams,
      quests: [inactiveQuest],
      progressRows: phase1TeamQuestProgress,
      submissions: []
    });

    expect(repository.getQuestAccess("team-ember", firstQuest.slug)).toEqual({
      status: "not_found"
    });
    expect(repository.getQuestAccess("team-ember", "bad/slug")).toEqual({
      status: "not_found"
    });
    expect(repository.getQuestAccess("team-ember", "missing-slug")).toEqual({
      status: "not_found"
    });
    expect(repository.getQuestAccess("missing", firstQuest.slug)).toEqual({
      status: "not_found"
    });
  });

  it("creates pending submissions scoped to the authenticated team and requested slug", () => {
    const repository = new PlayerRepository();
    const result = repository.submitProof(
      {
        teamId: "team-ember",
        questSlug: firstQuest.slug,
        contributorName: " Ala ",
        proofValue: " https://example.com/photo ",
        note: " gotowe "
      },
      "2026-05-21T10:00:00.000Z"
    );

    expect(result).toMatchObject({
      status: "created",
      submission: {
        id: "submission-0001",
        teamId: "team-ember",
        questId: firstQuest.id,
        contributorName: "Ala",
        proofValue: "https://example.com/photo",
        note: "gotowe",
        status: "pending"
      },
      progress: { status: "pending_review" }
    });
    expect(repository.getTeamSubmissions("team-iron")).toHaveLength(0);
    expect(repository.getTeamSubmissions("team-ember")).toHaveLength(1);
  });

  it("rejects proof submission for unknown quests", () => {
    const repository = new PlayerRepository();

    expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: "missing",
        contributorName: "Ala",
        proofValue: "https://example.com/photo",
        note: null
      })
    ).toEqual({ status: "quest_not_found" });
  });

  it("blocks duplicate active submissions and already approved progress", () => {
    const pendingSubmission = submission({
      status: "pending",
      questId: firstQuest.id
    });
    const approvedProgress = phase1TeamQuestProgress.map((progress) =>
      progress.teamId === "team-ember" && progress.questId === secondQuest.id
        ? { ...progress, status: "approved" as const }
        : progress
    );
    const repository = new PlayerRepository({
      teams: phase1Teams,
      quests: phase1Quests,
      progressRows: approvedProgress,
      submissions: [pendingSubmission]
    });

    expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: firstQuest.slug,
        contributorName: "Ala",
        proofValue: "https://example.com/photo",
        note: null
      })
    ).toEqual({ status: "blocked", reason: "active_submission" });
    expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: secondQuest.slug,
        contributorName: "Ala",
        proofValue: "https://example.com/video",
        note: null
      })
    ).toEqual({ status: "blocked", reason: "already_approved" });
  });

  it("allows immediate resubmission after rejection and keeps other team private", () => {
    const repository = new PlayerRepository();
    const rejected = repository.seedRejectedSubmission("team-ember", firstQuest.slug);
    const textRejected = repository.seedRejectedSubmission(
      "team-ember",
      phase1Quests[2].slug
    );

    expect(rejected).toMatchObject({
      status: "rejected",
      rejectionMessage: "Poprawcie dowod i wyslijcie ponownie."
    });
    expect(textRejected?.proofValue).toBe("stara odpowiedz");
    expect(repository.seedRejectedSubmission("team-ember", "missing")).toBeNull();

    const resubmitted = repository.submitProof(
      {
        teamId: "team-ember",
        questSlug: firstQuest.slug,
        contributorName: "Ola",
        proofValue: "https://example.com/new-photo",
        note: null
      },
      "2026-05-21T11:00:00.000Z"
    );

    expect(resubmitted.status).toBe("created");
    expect(repository.getTeamSubmissions("team-ember")).toHaveLength(3);
    expect(repository.getTeamSubmissions("team-iron")).toHaveLength(0);
  });

  it("sorts scoped team and quest submissions newest first and snapshots state", () => {
    const older = submission({
      id: "older",
      submittedAt: "2026-05-21T09:00:00.000Z"
    });
    const newer = submission({
      id: "newer",
      submittedAt: "2026-05-21T10:00:00.000Z"
    });
    const repository = new PlayerRepository({
      teams: phase1Teams,
      quests: phase1Quests,
      progressRows: [],
      submissions: [older, newer, submission({ id: "other", teamId: "team-iron" })]
    });

    expect(repository.getQuestAccess("team-ember", firstQuest.slug)).toMatchObject({
      status: "found",
      progress: { status: "not_started" }
    });
    expect(repository.getTeamSubmissions("team-ember").map((item) => item.id)).toEqual([
      "newer",
      "older"
    ]);
    expect(
      repository
        .getTeamQuestSubmissions("team-ember", firstQuest.id)
        .map((item) => item.id)
    ).toEqual(["newer", "older"]);
    expect(repository.snapshot()).toMatchObject({
      teams: phase1Teams,
      quests: phase1Quests
    });
  });

  it("creates and resets the singleton repository for runtime use", () => {
    const firstRepository = resetPlayerRepositoryForTests();

    expect(getPlayerRepository()).toBe(firstRepository);

    const secondRepository = resetPlayerRepositoryForTests({
      teams: phase1Teams,
      quests: phase1Quests,
      progressRows: phase1TeamQuestProgress,
      submissions: [submission()]
    });

    expect(secondRepository).not.toBe(firstRepository);
    expect(getPlayerRepository().getTeamSubmissions("team-ember")).toHaveLength(1);
  });
});

const submission = (overrides: Partial<Submission> = {}): Submission => ({
  id: "submission-existing",
  teamId: "team-ember",
  questId: firstQuest.id,
  contributorName: "Ala",
  proofKind: "photo_link",
  proofValue: "https://example.com/photo",
  note: null,
  status: "pending",
  rejectionReason: null,
  rejectionMessage: null,
  submittedAt: "2026-05-21T10:00:00.000Z",
  reviewedAt: null,
  ...overrides
});
