import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const { domainId } = await params;
  getDatabase().prepare("delete from blocked_domains where id = ? and user_id = ?").run(domainId, user.id);
  return NextResponse.redirect(new URL("/dashboard/settings", request.url), 303);
}

