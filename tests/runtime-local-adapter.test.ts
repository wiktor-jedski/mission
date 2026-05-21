import { describe, expect, it, vi } from "vitest";
import {
  createRuntimeRepository,
  setRuntimeRepositoryForTests
} from "@/lib/runtime";
import { LocalRuntimeRepository } from "@/lib/runtime/local-adapter";
import { createInitialSnapshot } from "@/lib/player/store";

const firstSlug = "amber-vault-k9q4m2x7";
const secondSlug = "silent-forge-p6t8n3v1";

describe("LocalRuntimeRepository", () => {
  it("can be selected explicitly for deterministic development smoke tests", () => {
    const previousOverride = process.env.MISSION_RUNTIME_REPOSITORY;
    process.env.MISSION_RUNTIME_REPOSITORY = "local";
    setRuntimeRepositoryForTests(undefined);

    expect(createRuntimeRepository()).toBeInstanceOf(LocalRuntimeRepository);

    if (previousOverride === undefined) {
      delete process.env.MISSION_RUNTIME_REPOSITORY;
    } else {
      process.env.MISSION_RUNTIME_REPOSITORY = previousOverride;
    }
    setRuntimeRepositoryForTests(undefined);
  });

  it("rejects the explicit local runtime override in production", () => {
    const previousOverride = process.env.MISSION_RUNTIME_REPOSITORY;
    process.env.MISSION_RUNTIME_REPOSITORY = "local";
    vi.stubEnv("NODE_ENV", "production");

    expect(() => createRuntimeRepository()).toThrow(
      "Local runtime repository is not allowed in production."
    );

    vi.unstubAllEnvs();
    if (previousOverride === undefined) {
      delete process.env.MISSION_RUNTIME_REPOSITORY;
    } else {
      process.env.MISSION_RUNTIME_REPOSITORY = previousOverride;
    }
    setRuntimeRepositoryForTests(undefined);
  });

  it("supports team, quest, submission, pending review, approval, and map reads", async () => {
    const repository = new LocalRuntimeRepository();

    await expect(repository.getTeams()).resolves.toHaveLength(2);
    await expect(repository.getQuests()).resolves.toHaveLength(25);
    await expect(repository.getTeam("missing")).resolves.toBeNull();
    await expect(repository.getQuestBySlug("bad slug")).resolves.toBeNull();
    await expect(repository.getQuestAccess("missing", firstSlug)).resolves.toEqual({
      status: "not_found"
    });

    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: firstSlug,
      contributorName: " Ala ",
      proofValue: " https://example.com/proof ",
      note: " note "
    });

    expect(created.status).toBe("created");
    await expect(repository.getTeamSubmissions("team-ember")).resolves.toHaveLength(1);
    await expect(repository.listPendingSubmissions()).resolves.toHaveLength(1);

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    const pending = await repository.getPendingSubmission(created.submission.id);
    expect(pending?.team.id).toBe("team-ember");
    expect(pending?.quest.slug).toBe(firstSlug);
    await repository.submitProof({
      teamId: "team-ember",
      questSlug: secondSlug,
      contributorName: "Ola",
      proofValue: "https://example.com/proof-2",
      note: null
    });

    const approved = await repository.approveSubmission(created.submission.id);
    expect(approved.status).toBe("updated");
    await expect(repository.listPendingSubmissions()).resolves.toHaveLength(1);
    await expect(repository.getTeamMapState("team-ember")).resolves.toMatchObject({
      approvedQuestCount: 1,
      revealedFragmentCount: 1,
      isFinalUnlocked: false
    });

    expect(repository.snapshot().auditLogs).toHaveLength(3);
  });

  it("blocks duplicates, allows rejected resubmission, and protects other teams", async () => {
    const repository = new LocalRuntimeRepository();
    const first = await repository.submitProof({
      teamId: "team-ember",
      questSlug: secondSlug,
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    expect(
      await repository.submitProof({
        teamId: "team-ember",
        questSlug: secondSlug,
        contributorName: "Ala",
        proofValue: "https://example.com/proof-2",
        note: null
      })
    ).toEqual({ status: "blocked", reason: "active_submission" });

    if (first.status !== "created") {
      throw new Error("Expected first submission.");
    }

    const rejected = await repository.rejectSubmission({
      submissionId: first.submission.id,
      reason: "wrong_proof",
      message: " popraw "
    });
    expect(rejected.status).toBe("updated");
    expect((await repository.getTeamSubmissions("team-ember"))[0]).toMatchObject({
      status: "rejected",
      rejectionMessage: "popraw"
    });

    await expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: secondSlug,
        contributorName: "Ola",
        proofValue: "https://example.com/new-proof",
        note: null
      })
    ).resolves.toMatchObject({ status: "created" });
    await expect(repository.getTeamMapState("team-iron")).resolves.toMatchObject({
      approvedQuestCount: 0,
      revealedFragmentCount: 0,
      isFinalUnlocked: false
    });
  });

  it("returns safe results for unknown or non-pending review actions", async () => {
    const repository = new LocalRuntimeRepository();

    await expect(repository.getPendingSubmission("missing")).resolves.toBeNull();
    await expect(repository.approveSubmission("missing")).resolves.toEqual({
      status: "not_found"
    });
    await expect(
      repository.rejectSubmission({
        submissionId: "missing",
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "not_found" });

    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: firstSlug,
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    await repository.approveSubmission(created.submission.id);
    await expect(repository.approveSubmission(created.submission.id)).resolves.toEqual({
      status: "invalid_transition"
    });
  });

  it("handles snapshots with missing review context", async () => {
    const snapshot = createInitialSnapshot();
    const repository = new LocalRuntimeRepository({
      ...snapshot,
      progressRows: [],
      submissions: [
        {
          id: "submission-01",
          teamId: "team-ember",
          questId: "quest-01",
          contributorName: "Ala",
          proofKind: "photo_link",
          proofValue: "https://example.com/proof",
          note: null,
          status: "pending",
          rejectionReason: null,
          rejectionMessage: null,
          submittedAt: "2026-05-21T10:00:00.000Z",
          reviewedAt: null
        }
      ]
    });

    await expect(repository.listPendingSubmissions()).resolves.toEqual([]);
    await expect(repository.approveSubmission("submission-01")).resolves.toEqual({
      status: "not_found"
    });
    await expect(
      repository.rejectSubmission({
        submissionId: "submission-01",
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "not_found" });
  });

  it("returns not found when review context disappears after a write", async () => {
    const snapshot = createInitialSnapshot();
    const pendingSubmission = {
      id: "submission-01",
      teamId: "team-ember",
      questId: "quest-01",
      contributorName: "Ala",
      proofKind: "photo_link" as const,
      proofValue: "https://example.com/proof",
      note: null,
      status: "pending" as const,
      rejectionReason: null,
      rejectionMessage: null,
      submittedAt: "2026-05-21T10:00:00.000Z",
      reviewedAt: null
    };

    await expect(
      new LocalRuntimeRepository({
        ...snapshot,
        quests: [],
        submissions: [pendingSubmission]
      }).approveSubmission("submission-01")
    ).resolves.toEqual({ status: "not_found" });
    await expect(
      new LocalRuntimeRepository({
        ...snapshot,
        quests: [],
        submissions: [pendingSubmission]
      }).rejectSubmission({
        submissionId: "submission-01",
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "not_found" });
  });

  it("reports invalid rejection transitions", async () => {
    const repository = new LocalRuntimeRepository();
    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: firstSlug,
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    await repository.rejectSubmission({
      submissionId: created.submission.id,
      reason: "other",
      message: null
    });
    await expect(
      repository.rejectSubmission({
        submissionId: created.submission.id,
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "invalid_transition" });
  });
});
