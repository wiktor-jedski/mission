import { NextResponse } from "next/server";
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
    return NextResponse.redirect(
      new URL(`/admin/login?error=config&next=${encodeURIComponent(nextPath)}`, request.url)
    );
  }

  if (verification.status === "invalid") {
    return NextResponse.redirect(
      new URL(`/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`, request.url)
    );
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    serializeAdminSession(createAdminSession(Date.now())),
    adminCookieOptions()
  );

  return response;
}

const stringValue = (value: FormDataEntryValue | null): string =>
  typeof value === "string" ? value : "";
