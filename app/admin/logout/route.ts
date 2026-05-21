import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  clearAdminCookieOptions
} from "@/lib/admin/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearAdminCookieOptions());
  return response;
}
