import type { AdminSessionParseResult } from "./session";
import { normalizeAdminRedirect } from "./session";

export type AdminAccessResult =
  | { status: "authenticated" }
  | { status: "redirect"; destination: string };

export const resolveAdminAccess = (
  sessionResult: AdminSessionParseResult,
  currentPath: string
): AdminAccessResult => {
  if (sessionResult.status === "authenticated") {
    return { status: "authenticated" };
  }

  const next = normalizeAdminRedirect(currentPath, "/admin");
  return {
    status: "redirect",
    destination: `/admin/login?next=${encodeURIComponent(next)}`
  };
};
