import { redirect } from "next/navigation";
import { requirePlayerTeam } from "@/app/player-session";
import { getRuntimeRepository } from "@/lib/runtime";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const teamId = await requirePlayerTeam(`/quests/${slug}`);
  await getRuntimeRepository().useHint(teamId, slug);
  redirect(`/quests/${slug}`);
}
