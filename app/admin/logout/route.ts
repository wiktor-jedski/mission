import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  clearAdminCookieOptions
} from "@/lib/admin/session";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", clearAdminCookieOptions());
  redirect("/admin/login");
}
