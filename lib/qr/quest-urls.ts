import { QUEST_COUNT } from "../domain/constants";
import type { Quest } from "../domain/types";

export type QuestUrlRow = {
  number: number;
  id: string;
  title: string;
  slug: string;
  url: string;
};

export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();

  if (!trimmed) {
    throw new Error("APP_BASE_URL is required to export quest URLs.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("APP_BASE_URL must be an absolute URL.");
  }

  if (parsed.protocol !== "https:" && !isLocalhost(parsed)) {
    throw new Error("APP_BASE_URL must use HTTPS outside localhost.");
  }

  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";

  return parsed.toString().replace(/\/$/, "");
}

export function buildQuestUrlRows(
  quests: readonly Quest[],
  baseUrl: string
): readonly QuestUrlRow[] {
  if (quests.length !== QUEST_COUNT) {
    throw new Error(`Expected ${QUEST_COUNT} quests for QR export.`);
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const seenSlugs = new Set<string>();

  return quests.map((quest, index) => {
    if (!quest.isActive) {
      throw new Error(`Quest must be active for QR export: ${quest.id}`);
    }

    if (seenSlugs.has(quest.slug)) {
      throw new Error(`Duplicate quest slug for QR export: ${quest.slug}`);
    }

    seenSlugs.add(quest.slug);

    return {
      number: index + 1,
      id: quest.id,
      title: quest.title,
      slug: quest.slug,
      url: `${normalizedBaseUrl}/quests/${quest.slug}`
    };
  });
}

export function formatQuestUrlRows(rows: readonly QuestUrlRow[]): string {
  return [
    "number,id,title,slug,url",
    ...rows.map((row) =>
      [
        row.number.toString().padStart(2, "0"),
        row.id,
        csvCell(row.title),
        row.slug,
        row.url
      ].join(",")
    )
  ].join("\n");
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function isLocalhost(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}
