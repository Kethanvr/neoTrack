import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { unlinkSync } from "node:fs";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const { activityId } = await params;
  const database = getDatabase();
  const activity = database.prepare("select screenshot_path from activities where id = ? and user_id = ?")
    .get(activityId, user.id) as { screenshot_path: string | null } | undefined;
  if (activity?.screenshot_path) try { unlinkSync(activity.screenshot_path); } catch { /* already removed */ }
  database.prepare("delete from activities where id = ? and user_id = ?").run(activityId, user.id);
  return NextResponse.redirect(new URL("/dashboard/timeline", request.url), 303);
}

