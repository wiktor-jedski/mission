import { requirePlayerTeam } from "@/app/player-session";
import { MapView } from "@/components/player/MapView";
import { getRuntimeRepository } from "@/lib/runtime";

export default async function MapPage() {
  const teamId = await requirePlayerTeam("/map");
  const map = await getRuntimeRepository().getTeamMapState(teamId);

  return <MapView map={map} />;
}
