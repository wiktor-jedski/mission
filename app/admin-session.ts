import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveAdminAccess } from "@/lib/admin/auth-guard";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSession
} from "@/lib/admin/session";

export async function requireAdmin(currentPath: string): Promise<void> {
  const cookieStore = await cookies();
  const access = resolveAdminAccess(
    parseAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, Date.now()),
    currentPath
  );

  if (access.status === "redirect") {
    redirect(access.destination);
  }
}
