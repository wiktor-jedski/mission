import { NextResponse } from "next/server";
import { getConfiguredTeamPins, verifyTeamPin } from "@/lib/player/pins";
import {
  createTeamSession,
  normalizePlayerRedirect,
  serializeTeamSession,
  TEAM_SESSION_COOKIE,
  TEAM_SESSION_MAX_AGE_SECONDS
} from "@/lib/player/session";
import { getRuntimeRepository } from "@/lib/runtime";

export async function POST(request: Request) {
  const formData = await request.formData();
  const pin = stringValue(formData.get("pin"));
  const nextPath = normalizePlayerRedirect(stringValue(formData.get("next")), "/");
  const repository = getRuntimeRepository();
  const verification = verifyTeamPin(
    pin,
    await repository.getTeams(),
    getConfiguredTeamPins()
  );

  if (verification.status === "invalid") {
    return NextResponse.redirect(
      new URL(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`, request.url)
    );
  }

  const session = createTeamSession(verification.teamId, Date.now());
  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(TEAM_SESSION_COOKIE, serializeTeamSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TEAM_SESSION_MAX_AGE_SECONDS
  });

  return response;
}

const stringValue = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";
