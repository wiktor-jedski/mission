import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEAM_SESSION_COOKIE } from "@/lib/player/session";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(TEAM_SESSION_COOKIE);
  redirect("/login");
}
