import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin-session";
import { validateOverrideAction } from "@/lib/admin/override-actions";
import { getRuntimeRepository } from "@/lib/runtime";

export async function POST(request: Request) {
  await requireAdmin("/admin/overrides");
  const formData = await request.formData();
  const validation = validateOverrideAction({
    action: stringValue(formData.get("action")),
    teamId: stringValue(formData.get("teamId")),
    questId: stringValue(formData.get("questId")),
    reason: stringValue(formData.get("reason")),
    contributorName: stringValue(formData.get("contributorName")),
    proofKind: stringValue(formData.get("proofKind")),
    proofValue: stringValue(formData.get("proofValue")),
    note: stringValue(formData.get("note")),
    status: stringValue(formData.get("status"))
  });

  if (!validation.valid) {
    redirect("/admin?error=invalid");
  }

  const repository = getRuntimeRepository();
  const result = await runOverride(repository, validation.data);

  if (result.status !== "updated") {
    redirect("/admin?error=invalid");
  }

  redirect("/admin");
}

const runOverride = async (
  repository: ReturnType<typeof getRuntimeRepository>,
  input: Exclude<ReturnType<typeof validateOverrideAction>, { valid: false }>["data"]
) => {
  switch (input.action) {
    case "reveal":
      return repository.revealManualFragment({ teamId: input.teamId });
    case "hide":
      return repository.hideManualFragment({
        teamId: input.teamId,
        reason: input.reason
      });
    case "skip":
      return repository.skipQuest({
        teamId: input.teamId,
        questId: input.questId,
        reason: input.reason
      });
    case "override":
      return repository.overrideBrokenQuest({
        teamId: input.teamId,
        questId: input.questId,
        reason: input.reason
      });
    case "replacement":
      return repository.enterReplacementProof({
        teamId: input.teamId,
        questId: input.questId,
        contributorName: input.contributorName,
        proofKind: input.proofKind,
        proofValue: input.proofValue,
        note: input.note,
        status: input.status
      });
  }
};

const stringValue = (value: FormDataEntryValue | null): string | null =>
  typeof value === "string" ? value : null;
