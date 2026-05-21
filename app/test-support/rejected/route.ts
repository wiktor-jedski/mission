import { NextResponse } from "next/server";
import { getRuntimeRepository } from "@/lib/runtime";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json()) as Partial<{
    teamId: string;
    questSlug: string;
  }>;

  if (!body.teamId || !body.questSlug) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const repository = getRuntimeRepository();
  const created = await repository.submitProof({
    teamId: body.teamId,
    questSlug: body.questSlug,
    contributorName: "Test",
    proofValue: "https://example.com/stary-dowod",
    note: null
  });

  if (created.status !== "created") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const rejected = await repository.rejectSubmission({
    submissionId: created.submission.id,
    reason: "wrong_proof",
    message: "Poprawcie dowod i wyslijcie ponownie."
  });

  return rejected.status === "updated"
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}
