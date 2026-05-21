import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    redirect(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  const session = createTeamSession(verification.teamId, Date.now());
  const cookieStore = await cookies();
  cookieStore.set(TEAM_SESSION_COOKIE, serializeTeamSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TEAM_SESSION_MAX_AGE_SECONDS
  });

  redirect(nextPath);
}

const stringValue = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";
