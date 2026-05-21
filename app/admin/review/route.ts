import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/admin-session";
import { validateReviewAction } from "@/lib/admin/review-actions";
import { getRuntimeRepository } from "@/lib/runtime";

export async function POST(request: Request) {
  await requireAdmin("/admin");
  const formData = await request.formData();
  const validation = validateReviewAction({
    action: stringValue(formData.get("action")),
    submissionId: stringValue(formData.get("submissionId")),
    reason: stringValue(formData.get("reason")),
    message: stringValue(formData.get("message"))
  });

  if (!validation.valid) {
    redirect("/admin?error=invalid");
  }

  const repository = getRuntimeRepository();
  const result =
    validation.data.action === "approve"
      ? await repository.approveSubmission(validation.data.submissionId)
      : await repository.rejectSubmission({
          submissionId: validation.data.submissionId,
          reason: validation.data.reason,
          message: validation.data.message
        });

  if (result.status !== "updated") {
    redirect("/admin?error=invalid");
  }

  redirect("/admin");
}

const stringValue = (value: FormDataEntryValue | null): string | null =>
  typeof value === "string" ? value : null;
