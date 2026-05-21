import type { SessionParseResult } from "@/lib/player/session";

export type PlayerAccessResult =
  | { status: "allowed"; teamId: string }
  | { status: "redirect"; destination: string };

export const resolvePlayerAccess = (
  sessionResult: SessionParseResult,
  teamExists: (teamId: string) => boolean,
  currentPath: string
): PlayerAccessResult => {
  if (sessionResult.status !== "authenticated") {
    return { status: "redirect", destination: loginDestination(currentPath) };
  }

  if (!teamExists(sessionResult.session.teamId)) {
    return { status: "redirect", destination: loginDestination(currentPath) };
  }

  return { status: "allowed", teamId: sessionResult.session.teamId };
};

const loginDestination = (currentPath: string): string => {
  const safePath = currentPath.startsWith("/") && !currentPath.startsWith("//")
    ? currentPath
    : "/";

  return `/login?next=${encodeURIComponent(safePath)}`;
};
