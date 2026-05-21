import type { Team } from "@/lib/domain/types";

export type TeamPinRecord = {
  teamId: string;
  pin: string;
};

export type PinVerificationResult =
  | { status: "valid"; teamId: string }
  | { status: "invalid" };

const localFallbackPins: readonly TeamPinRecord[] = [
  { teamId: "team-ember", pin: "1111" },
  { teamId: "team-iron", pin: "2222" }
];

export const parseTeamPins = (
  rawPins: string | undefined,
  fallbackPins: readonly TeamPinRecord[] = localFallbackPins
): readonly TeamPinRecord[] => {
  if (!rawPins?.trim()) {
    return fallbackPins;
  }

  return rawPins
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [teamId, ...pinParts] = entry.split(":");
      const pin = pinParts.join(":").trim();

      if (!teamId?.trim() || !pin) {
        throw new Error("TEAM_PINS entries must use team-id:pin format.");
      }

      return { teamId: teamId.trim(), pin };
    });
};

export const verifyTeamPin = (
  submittedPin: string,
  teams: readonly Team[],
  configuredPins: readonly TeamPinRecord[]
): PinVerificationResult => {
  const pin = submittedPin.trim();

  if (!pin) {
    return { status: "invalid" };
  }

  const validTeamIds = new Set(teams.map((team) => team.id));
  const matchedPin = configuredPins.find(
    (record) => record.pin === pin && validTeamIds.has(record.teamId)
  );

  return matchedPin
    ? { status: "valid", teamId: matchedPin.teamId }
    : { status: "invalid" };
};

export const getConfiguredTeamPins = (): readonly TeamPinRecord[] =>
  parseTeamPins(process.env.TEAM_PINS);
