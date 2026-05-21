import { cookies } from "next/headers";
import { PlayerHome } from "@/components/player/PlayerHome";
import {
  parseTeamSession,
  TEAM_SESSION_COOKIE
} from "@/lib/player/session";
import { getPlayerRepository } from "@/lib/player/store";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionResult = parseTeamSession(
    cookieStore.get(TEAM_SESSION_COOKIE)?.value,
    Date.now()
  );
  const team =
    sessionResult.status === "authenticated"
      ? getPlayerRepository().getTeam(sessionResult.session.teamId)
      : null;

  return <PlayerHome teamName={team?.name} />;
}
