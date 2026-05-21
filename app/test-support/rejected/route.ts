import { NextResponse } from "next/server";
import { getPlayerRepository } from "@/lib/player/store";

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

  const submission = getPlayerRepository().seedRejectedSubmission(
    body.teamId,
    body.questSlug
  );

  return submission
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}
