import { describe, expect, it } from "vitest";
import {
  buildQuestUrlRows,
  formatQuestUrlRows,
  normalizeBaseUrl
} from "@/lib/qr/quest-urls";
import { phase1Quests } from "@/lib/seed/phase1";

describe("quest URL export", () => {
  it("normalizes the final base URL for QR links", () => {
    expect(normalizeBaseUrl(" https://mission.example/path/?debug=1#top ")).toBe(
      "https://mission.example/path"
    );
    expect(normalizeBaseUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000"
    );
  });

  it("builds all production quest URLs from the base URL and seed slugs", () => {
    const rows = buildQuestUrlRows(phase1Quests, "https://mission.example/");

    expect(rows).toHaveLength(25);
    expect(rows[0]).toEqual({
      number: 1,
      id: "quest-01",
      title: "Pieczec Bursztynu",
      slug: "amber-vault-k9q4m2x7",
      url: "https://mission.example/quests/amber-vault-k9q4m2x7"
    });
    expect(new Set(rows.map((row) => row.url)).size).toBe(25);
  });

  it("formats a copyable CSV for QR generation", () => {
    expect(
      formatQuestUrlRows([
        {
          number: 1,
          id: "quest-01",
          title: "Comma, Quest",
          slug: "comma-quest-a1b2c3d4",
          url: "https://mission.example/quests/comma-quest-a1b2c3d4"
        },
        {
          number: 2,
          id: "quest-02",
          title: 'Quote "Quest"',
          slug: "quote-quest-a1b2c3d4",
          url: "https://mission.example/quests/quote-quest-a1b2c3d4"
        },
        {
          number: 3,
          id: "quest-03",
          title: "Plain Quest",
          slug: "plain-quest-a1b2c3d4",
          url: "https://mission.example/quests/plain-quest-a1b2c3d4"
        }
      ])
    ).toBe(
      [
        "number,id,title,slug,url",
        '01,quest-01,"Comma, Quest",comma-quest-a1b2c3d4,https://mission.example/quests/comma-quest-a1b2c3d4',
        '02,quest-02,"Quote ""Quest""",quote-quest-a1b2c3d4,https://mission.example/quests/quote-quest-a1b2c3d4',
        "03,quest-03,Plain Quest,plain-quest-a1b2c3d4,https://mission.example/quests/plain-quest-a1b2c3d4"
      ].join("\n")
    );
  });

  it("rejects malformed input that would produce unsafe QR links", () => {
    expect(() => normalizeBaseUrl("")).toThrow(
      "APP_BASE_URL is required to export quest URLs."
    );
    expect(() => normalizeBaseUrl("mission.example")).toThrow(
      "APP_BASE_URL must be an absolute URL."
    );
    expect(() => normalizeBaseUrl("http://mission.example")).toThrow(
      "APP_BASE_URL must use HTTPS outside localhost."
    );
    expect(() =>
      buildQuestUrlRows(phase1Quests.slice(0, 24), "https://mission.example")
    ).toThrow("Expected 25 quests for QR export.");
    expect(() =>
      buildQuestUrlRows(
        [
          phase1Quests[0],
          ...phase1Quests.slice(1).map((quest, index) =>
            index === 0 ? { ...quest, slug: phase1Quests[0].slug } : quest
          )
        ],
        "https://mission.example"
      )
    ).toThrow("Duplicate quest slug for QR export: amber-vault-k9q4m2x7");
    expect(() =>
      buildQuestUrlRows(
        [{ ...phase1Quests[0], isActive: false }, ...phase1Quests.slice(1)],
        "https://mission.example"
      )
    ).toThrow("Quest must be active for QR export: quest-01");
  });
});
