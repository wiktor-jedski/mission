import { SubmissionsView } from "@/components/player/SubmissionsView";
import { getPlayerRepository } from "@/lib/player/store";
import { buildSubmissionStatusViews } from "@/lib/player/view-models";
import { requirePlayerTeam } from "@/app/player-session";

export default async function SubmissionsPage() {
  const teamId = await requirePlayerTeam("/submissions");
  const repository = getPlayerRepository();
  const snapshot = repository.snapshot();

  return (
    <SubmissionsView
      submissions={buildSubmissionStatusViews(
        repository.getTeamSubmissions(teamId),
        snapshot.quests
      )}
    />
  );
}
