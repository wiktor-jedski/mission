import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/admin-session";
import { getRuntimeRepository } from "@/lib/runtime";

export async function GET() {
  await requireAdmin("/admin");
  const reviews = await getRuntimeRepository().listPendingSubmissions();
  return NextResponse.json({ reviews });
}
