import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  parseTeamSession,
  TEAM_SESSION_COOKIE
} from "@/lib/player/session";
import { getRuntimeRepository } from "@/lib/runtime";

export async function requirePlayerTeam(currentPath: string): Promise<string> {
  const cookieStore = await cookies();
  const repository = getRuntimeRepository();
  const sessionResult = parseTeamSession(
    cookieStore.get(TEAM_SESSION_COOKIE)?.value,
    Date.now()
  );
  if (sessionResult.status !== "authenticated") {
    redirect(loginDestination(currentPath));
  }

  const team = await repository.getTeam(sessionResult.session.teamId);

  if (!team) {
    redirect(loginDestination(currentPath));
  }

  return sessionResult.session.teamId;
}

const loginDestination = (currentPath: string): string => {
  const safePath = currentPath.startsWith("/") && !currentPath.startsWith("//")
    ? currentPath
    : "/";

  return `/login?next=${encodeURIComponent(safePath)}`;
};
