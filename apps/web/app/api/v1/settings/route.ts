import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { NextResponse } from "next/server";
import { z } from "zod";

const settingsSchema = z.object({
  captureInterval: z.coerce.number().int().min(30).max(3600),
  idleThreshold: z.coerce.number().int().min(30).max(3600),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const data = Object.fromEntries(await request.formData());
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) return NextResponse.redirect(new URL("/dashboard/settings?error=invalid", request.url), 303);
  getDatabase().prepare(
    `update user_settings set screenshot_enabled = ?, capture_interval_seconds = ?, idle_threshold_seconds = ?,
      store_full_url = ?, store_page_title = ?, auto_delete_screenshots = ?, updated_at = ? where user_id = ?`,
  ).run(data.screenshotEnabled ? 1 : 0, parsed.data.captureInterval, parsed.data.idleThreshold,
    data.storeFullUrl ? 1 : 0, data.storePageTitle ? 1 : 0, data.autoDelete ? 1 : 0,
    new Date().toISOString(), user.id);
  return NextResponse.redirect(new URL("/dashboard/settings?saved=1", request.url), 303);
}

