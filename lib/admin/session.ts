export const ADMIN_SESSION_COOKIE = "mission_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type AdminSession = {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
};

export type AdminSessionParseResult =
  | { status: "authenticated"; session: AdminSession }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "expired" };

export const createAdminSession = (
  issuedAt: number,
  maxAgeSeconds = ADMIN_SESSION_MAX_AGE_SECONDS
): AdminSession => {
  if (!Number.isFinite(issuedAt) || issuedAt < 0) {
    throw new Error("Issued timestamp is invalid.");
  }

  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 1) {
    throw new Error("Session max age must be positive.");
  }

  return {
    role: "admin",
    issuedAt,
    expiresAt: issuedAt + maxAgeSeconds * 1000
  };
};

export const serializeAdminSession = (session: AdminSession): string =>
  Buffer.from(JSON.stringify(session), "utf8").toString("base64url");

export const parseAdminSession = (
  serializedSession: string | undefined,
  now: number
): AdminSessionParseResult => {
  if (!serializedSession) {
    return { status: "missing" };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(serializedSession, "base64url").toString("utf8")
    ) as Partial<AdminSession>;

    if (
      parsed.role !== "admin" ||
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
        role: "admin",
        issuedAt: parsed.issuedAt,
        expiresAt: parsed.expiresAt
      }
    };
  } catch {
    return { status: "invalid" };
  }
};

export const adminCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/admin",
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS
});

export const clearAdminCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/admin",
  maxAge: 0
});

export const isSafeAdminRedirect = (path: string): boolean =>
  path.startsWith("/admin") &&
  !path.startsWith("//") &&
  !path.includes("://") &&
  path !== "/admin/login";

export const normalizeAdminRedirect = (
  path: string | null | undefined,
  fallback = "/admin"
): string => {
  if (!path?.trim()) {
    return fallback;
  }

  return isSafeAdminRedirect(path) ? path : fallback;
};
