import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ deviceId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const { deviceId } = await params;
  getDatabase().prepare("update devices set revoked_at = ? where id = ? and user_id = ?")
    .run(new Date().toISOString(), deviceId, user.id);
  return NextResponse.redirect(new URL("/dashboard/connect", request.url), 303);
}

