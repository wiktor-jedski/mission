import { redirect } from "next/navigation";
import { requirePlayerTeam } from "@/app/player-session";
import { validateSubmissionForm } from "@/lib/player/submission-form";
import { getRuntimeRepository } from "@/lib/runtime";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const teamId = await requirePlayerTeam(`/quests/${slug}`);
  const repository = getRuntimeRepository();
  const questAccess = await repository.getQuestAccess(teamId, slug);

  if (questAccess.status === "not_found") {
    redirect(`/quests/${slug}`);
  }

  const formData = await request.formData();
  const validation = validateSubmissionForm(
    {
      contributorName: stringValue(formData.get("contributorName")),
      proofValue: stringValue(formData.get("proofValue")),
      note: stringValue(formData.get("note"))
    },
    questAccess.quest.proofKind
  );

  if (!validation.valid) {
    redirect(`/quests/${slug}?error=invalid`);
  }

  const result = await repository.submitProof({
    teamId,
    questSlug: slug,
    contributorName: validation.data.contributorName,
    proofValue: validation.data.proofValue,
    note: validation.data.note
  });

  if (result.status !== "created") {
    redirect(`/quests/${slug}`);
  }

  redirect(`/quests/${slug}`);
}

const stringValue = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";
