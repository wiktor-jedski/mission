import { NextResponse } from "next/server";
import { TEAM_SESSION_COOKIE } from "@/lib/player/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(TEAM_SESSION_COOKIE);
  return response;
}
