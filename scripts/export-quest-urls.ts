import { phase1Quests } from "../lib/seed/phase1";
import { buildQuestUrlRows, formatQuestUrlRows } from "../lib/qr/quest-urls";

const appBaseUrl = process.env.APP_BASE_URL;

if (!appBaseUrl) {
  throw new Error("Set APP_BASE_URL before running quest URL export.");
}

const rows = buildQuestUrlRows(phase1Quests, appBaseUrl);
process.stdout.write(`${formatQuestUrlRows(rows)}\n`);
