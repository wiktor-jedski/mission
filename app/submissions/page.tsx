import { SubmissionsView } from "@/components/player/SubmissionsView";
import { buildSubmissionStatusViews } from "@/lib/player/view-models";
import { requirePlayerTeam } from "@/app/player-session";
import { getRuntimeRepository } from "@/lib/runtime";

export default async function SubmissionsPage() {
  const teamId = await requirePlayerTeam("/submissions");
  const repository = getRuntimeRepository();
  const [submissions, quests] = await Promise.all([
    repository.getTeamSubmissions(teamId),
    repository.getQuests()
  ]);

  return (
    <SubmissionsView
      submissions={buildSubmissionStatusViews(submissions, quests)}
    />
  );
}
