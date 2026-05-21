import { UnknownQuestView } from "@/components/player/UnknownQuestView";
import { QuestPageView } from "@/components/player/QuestPageView";
import { buildQuestViewModel } from "@/lib/player/view-models";
import { getRuntimeRepository } from "@/lib/runtime";
import { requirePlayerTeam } from "@/app/player-session";

type QuestPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuestPage({ params, searchParams }: QuestPageProps) {
  const { slug } = await params;
  const teamId = await requirePlayerTeam(`/quests/${slug}`);
  const repository = getRuntimeRepository();
  const questAccess = await repository.getQuestAccess(teamId, slug);

  if (questAccess.status === "not_found") {
    return <UnknownQuestView />;
  }

  await repository.recordQuestView(teamId, questAccess.quest.id);
  const query = await searchParams;
  const error = query?.error === "invalid" ? "Sprawdz dane i sprobuj ponownie." : undefined;

  return (
    <QuestPageView
      quest={buildQuestViewModel(
        questAccess.quest,
        questAccess.progress,
        questAccess.submissions
      )}
      error={error}
    />
  );
}
