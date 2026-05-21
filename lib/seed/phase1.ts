import {
  isProofKind,
  QUEST_COUNT,
  TEAM_COUNT
} from "../domain/constants";
import type { Quest, Team, TeamQuestProgress } from "../domain/types";

export const phase1Teams: readonly Team[] = [
  {
    id: "team-ember",
    name: "Druzyna Zarzewia",
    pinHash: "phase1-placeholder-pin-hash-ember",
    createdAt: "2026-05-21T00:00:00.000Z"
  },
  {
    id: "team-iron",
    name: "Druzyna Zelaza",
    pinHash: "phase1-placeholder-pin-hash-iron",
    createdAt: "2026-05-21T00:00:00.000Z"
  }
];

export const phase1Quests: readonly Quest[] = [
  quest(1, "amber-vault-k9q4m2x7", "Pieczec Bursztynu", "photo_link"),
  quest(2, "silent-forge-p6t8n3v1", "Cicha Kuznia", "video_link"),
  quest(3, "moonlit-riddle-x2c7b9h5", "Ksiezycowa Zagadka", "text_response"),
  quest(4, "broken-compass-r8w1s6d4", "Zlamany Kompas", "photo_link"),
  quest(5, "river-oath-m5z9q2a8", "Przysiega Rzeki", "audio_link"),
  quest(6, "storm-banner-v7d3k1p9", "Sztandar Burzy", "photo_link"),
  quest(7, "hidden-crown-b4n8y6t2", "Ukryta Korona", "video_link"),
  quest(8, "silver-goblet-f1h6r3w9", "Srebrny Kielich", "photo_link"),
  quest(9, "ashen-library-z8p2m5c7", "Popielna Biblioteka", "text_response"),
  quest(10, "candle-bridge-t3q7x1n6", "Most Swiec", "photo_link"),
  quest(11, "wolfsbane-letter-h9v4d8s2", "List Wilczego Ziela", "text_response"),
  quest(12, "obsidian-key-c6m1r9k4", "Obsydianowy Klucz", "video_link"),
  quest(13, "mist-harbor-y2s8w5p1", "Mglisty Port", "audio_link"),
  quest(14, "golden-antler-n7b3x6q8", "Zloty Rog", "photo_link"),
  quest(15, "ember-choir-d5k9t2v7", "Chor Zarzewia", "audio_link"),
  quest(16, "frost-tower-q1r6c8m3", "Wieza Mrozu", "photo_link"),
  quest(17, "runic-kitchen-w4p7z2h8", "Runiczna Kuchnia", "video_link"),
  quest(18, "crimson-lantern-m8x3n6b1", "Karmazynowa Latarnia", "photo_link"),
  quest(19, "starlit-ledger-k2d9v5s7", "Gwiazdowy Rejestr", "text_response"),
  quest(20, "ivory-drum-p5h1q8r4", "Kosciowy Beben", "audio_link"),
  quest(21, "last-obelisk-s9c4m7x2", "Ostatni Obelisk", "photo_link"),
  quest(22, "shadow-market-b6v2t9d5", "Targ Cieni", "video_link"),
  quest(23, "copper-mirror-r3y8k1p6", "Miedziane Lustro", "photo_link"),
  quest(24, "ancient-echo-x7n5h2w9", "Pradawne Echo", "audio_link"),
  quest(25, "final-sigil-l4q9c6z3", "Ostatni Znak", "text_response")
];

export const phase1TeamQuestProgress: readonly TeamQuestProgress[] =
  phase1Teams.flatMap((team) =>
    phase1Quests.map((questItem) => ({
      id: `${team.id}-${questItem.id}`,
      teamId: team.id,
      questId: questItem.id,
      status: "not_started",
      hintUsedAt: null,
      approvedAt: null,
      skippedAt: null
    }))
  );

export type SeedValidationResult = {
  teamCount: number;
  questCount: number;
  progressCount: number;
};

export const validatePhase1SeedData = (
  teams: readonly Team[] = phase1Teams,
  quests: readonly Quest[] = phase1Quests,
  progressRows: readonly TeamQuestProgress[] = phase1TeamQuestProgress
): SeedValidationResult => {
  if (teams.length !== TEAM_COUNT) {
    throw new Error(`Expected ${TEAM_COUNT} teams.`);
  }

  if (quests.length !== QUEST_COUNT) {
    throw new Error(`Expected ${QUEST_COUNT} quests.`);
  }

  const slugs = new Set(quests.map((questItem) => questItem.slug));
  if (slugs.size !== quests.length) {
    throw new Error("Quest slugs must be unique.");
  }

  const invalidSlug = quests.find((questItem) => !isUnguessableSlug(questItem.slug));
  if (invalidSlug) {
    throw new Error(`Quest slug is not unguessable: ${invalidSlug.slug}`);
  }

  const invalidProofKind = quests.find(
    (questItem) => !isProofKind(questItem.proofKind)
  );
  if (invalidProofKind) {
    throw new Error(`Quest proof kind is invalid: ${invalidProofKind.id}`);
  }

  const inactiveQuest = quests.find((questItem) => !questItem.isActive);
  if (inactiveQuest) {
    throw new Error(`Quest must be active by default: ${inactiveQuest.id}`);
  }

  const expectedProgressCount = teams.length * quests.length;
  if (progressRows.length !== expectedProgressCount) {
    throw new Error(`Expected ${expectedProgressCount} progress rows.`);
  }

  const progressKeys = new Set(
    progressRows.map((row) => `${row.teamId}:${row.questId}`)
  );
  for (const team of teams) {
    for (const questItem of quests) {
      if (!progressKeys.has(`${team.id}:${questItem.id}`)) {
        throw new Error(`Missing progress row for ${team.id}/${questItem.id}.`);
      }
    }
  }

  const nonInitialProgress = progressRows.find(
    (row) => row.status !== "not_started"
  );
  if (nonInitialProgress) {
    throw new Error(`Initial progress must be not_started: ${nonInitialProgress.id}`);
  }

  return {
    teamCount: teams.length,
    questCount: quests.length,
    progressCount: progressRows.length
  };
};

export const isUnguessableSlug = (slug: string): boolean =>
  /^[a-z]+(?:-[a-z]+)+-[a-z0-9]{8}$/.test(slug) && !/\b(?:quest|task)-?\d+\b/.test(slug);

function quest(
  number: number,
  slug: string,
  title: string,
  proofKind: Quest["proofKind"]
): Quest {
  return {
    id: `quest-${number.toString().padStart(2, "0")}`,
    slug,
    title,
    flavorText: `Krotki opis misji ${number}.`,
    instructions: `Wykonaj misje ${number} i przygotuj dowod.`,
    successCriteria: "Dowod musi pokazac ukonczone zadanie.",
    safetyWarning: "Bez szkody, bez presji i bez przeszkadzania sasiadom.",
    proofKind,
    hintText: `Podpowiedz do misji ${number}.`,
    isActive: true
  };
}
