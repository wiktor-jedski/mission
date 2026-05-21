import { describe, expect, it } from "vitest";
import {
  isUnguessableSlug,
  phase1Quests,
  phase1TeamQuestProgress,
  phase1Teams,
  validatePhase1SeedData
} from "@/lib/seed/phase1";

describe("Phase 1 seed data", () => {
  it("contains exactly two teams, twenty-one quests, and complete initial progress", () => {
    expect(validatePhase1SeedData()).toEqual({
      teamCount: 2,
      questCount: 21,
      progressCount: 42
    });
    expect(phase1Teams).toHaveLength(2);
    expect(phase1Quests).toHaveLength(21);
    expect(phase1TeamQuestProgress).toHaveLength(42);
  });

  it("validates slug shape and rejects predictable slug forms", () => {
    expect(isUnguessableSlug("amber-vault-k9q4m2x7")).toBe(true);
    expect(isUnguessableSlug("quest-01")).toBe(false);
    expect(isUnguessableSlug("plain")).toBe(false);
  });

  it("rejects invalid seed counts and duplicate slugs", () => {
    expect(() => validatePhase1SeedData(phase1Teams.slice(0, 1))).toThrow(
      "Expected 2 teams."
    );
    expect(() =>
      validatePhase1SeedData(phase1Teams, phase1Quests.slice(0, 20))
    ).toThrow("Expected 21 quests.");
    expect(() =>
      validatePhase1SeedData(phase1Teams, [
        phase1Quests[0],
        ...phase1Quests.slice(1).map((quest, index) =>
          index === 0 ? { ...quest, slug: phase1Quests[0].slug } : quest
        )
      ])
    ).toThrow("Quest slugs must be unique.");
  });

  it("rejects invalid quest fields", () => {
    expect(() =>
      validatePhase1SeedData(phase1Teams, [
        { ...phase1Quests[0], slug: "quest-01" },
        ...phase1Quests.slice(1)
      ])
    ).toThrow("Quest slug is not unguessable: quest-01");
    expect(() =>
      validatePhase1SeedData(phase1Teams, [
        { ...phase1Quests[0], proofKind: "upload" as never },
        ...phase1Quests.slice(1)
      ])
    ).toThrow("Quest proof kind is invalid: quest-01");
    expect(() =>
      validatePhase1SeedData(phase1Teams, [
        { ...phase1Quests[0], isActive: false },
        ...phase1Quests.slice(1)
      ])
    ).toThrow("Quest must be active by default: quest-01");
  });

  it("rejects incomplete or noninitial progress rows", () => {
    expect(() =>
      validatePhase1SeedData(
        phase1Teams,
        phase1Quests,
        phase1TeamQuestProgress.slice(0, 41)
      )
    ).toThrow("Expected 42 progress rows.");

    expect(() =>
      validatePhase1SeedData(phase1Teams, phase1Quests, [
        ...phase1TeamQuestProgress.filter(
          (row) => row.id !== "team-ember-quest-01"
        ),
        {
          ...phase1TeamQuestProgress[0],
          id: "duplicate-other-quest",
          questId: "quest-02"
        }
      ])
    ).toThrow("Missing progress row for team-ember/quest-01.");

    expect(() =>
      validatePhase1SeedData(phase1Teams, phase1Quests, [
        { ...phase1TeamQuestProgress[0], status: "approved" },
        ...phase1TeamQuestProgress.slice(1)
      ])
    ).toThrow("Initial progress must be not_started: team-ember-quest-01");
  });
});
