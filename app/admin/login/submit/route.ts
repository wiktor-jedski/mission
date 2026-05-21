import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPassword } from "@/lib/admin/password";
import {
  adminCookieOptions,
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  normalizeAdminRedirect,
  serializeAdminSession
} from "@/lib/admin/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = stringValue(formData.get("password"));
  const nextPath = normalizeAdminRedirect(stringValue(formData.get("next")));
  const verification = verifyAdminPassword(password);

  if (verification.status === "missing_configuration") {
    redirect(`/admin/login?error=config&next=${encodeURIComponent(nextPath)}`);
  }

  if (verification.status === "invalid") {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    serializeAdminSession(createAdminSession(Date.now())),
    adminCookieOptions()
  );

  redirect(nextPath);
}

const stringValue = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";
