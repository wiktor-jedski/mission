import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPlayerRepository } from "@/lib/player/store";
import {
  parseTeamSession,
  TEAM_SESSION_COOKIE
} from "@/lib/player/session";
import { resolvePlayerAccess } from "@/lib/player/auth-guard";

export async function requirePlayerTeam(currentPath: string): Promise<string> {
  const cookieStore = await cookies();
  const repository = getPlayerRepository();
  const sessionResult = parseTeamSession(
    cookieStore.get(TEAM_SESSION_COOKIE)?.value,
    Date.now()
  );
  const access = resolvePlayerAccess(
    sessionResult,
    (teamId) => repository.getTeam(teamId) !== null,
    currentPath
  );

  if (access.status === "redirect") {
    redirect(access.destination);
  }

  return access.teamId;
}
