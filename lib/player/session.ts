export const TEAM_SESSION_COOKIE = "mission_team_session";
export const TEAM_SESSION_MAX_AGE_SECONDS = 60 * 60 * 36;

export type TeamSession = {
  teamId: string;
  issuedAt: number;
  expiresAt: number;
};

export type SessionParseResult =
  | { status: "authenticated"; session: TeamSession }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "expired" };

export const createTeamSession = (
  teamId: string,
  issuedAt: number,
  maxAgeSeconds = TEAM_SESSION_MAX_AGE_SECONDS
): TeamSession => {
  if (!teamId.trim()) {
    throw new Error("Team id is required.");
  }

  if (!Number.isFinite(issuedAt) || issuedAt < 0) {
    throw new Error("Issued timestamp is invalid.");
  }

  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 1) {
    throw new Error("Session max age must be positive.");
  }

  return {
    teamId,
    issuedAt,
    expiresAt: issuedAt + maxAgeSeconds * 1000
  };
};

export const serializeTeamSession = (session: TeamSession): string =>
  Buffer.from(JSON.stringify(session), "utf8").toString("base64url");

export const parseTeamSession = (
  serializedSession: string | undefined,
  now: number
): SessionParseResult => {
  if (!serializedSession) {
    return { status: "missing" };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(serializedSession, "base64url").toString("utf8")
    ) as Partial<TeamSession>;

    if (
      typeof parsed.teamId !== "string" ||
      !parsed.teamId.trim() ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return { status: "invalid" };
    }

    if (parsed.expiresAt <= now) {
      return { status: "expired" };
    }

    return {
      status: "authenticated",
      session: {
        teamId: parsed.teamId,
        issuedAt: parsed.issuedAt,
        expiresAt: parsed.expiresAt
      }
    };
  } catch {
    return { status: "invalid" };
  }
};

export const isSafePlayerRedirect = (path: string): boolean =>
  path.startsWith("/") &&
  !path.startsWith("//") &&
  !path.startsWith("/admin") &&
  !path.includes("://");

export const normalizePlayerRedirect = (
  path: string | null | undefined,
  fallback = "/"
): string => {
  if (!path?.trim()) {
    return fallback;
  }

  return isSafePlayerRedirect(path) ? path : fallback;
};
