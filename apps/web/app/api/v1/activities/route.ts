import { activityInputSchema } from "@neotrace/shared";
import { authenticateDevice, deviceUnauthorized } from "@/lib/device-auth";
import { getDatabase } from "@/lib/database";
import { createId } from "@/lib/security";
import { sanitizeUrl } from "@/lib/url";

export async function POST(request: Request) {
  const device = authenticateDevice(request);
  if (!device) return deviceUnauthorized();
  const parsed = activityInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid activity payload.", issues: parsed.error.issues }, { status: 400 });
  const database = getDatabase();
  const session = database.prepare("select id from tracking_sessions where id = ? and device_id = ?")
    .get(parsed.data.sessionId, device.id);
  if (!session) return Response.json({ error: "Tracking session not found." }, { status: 404 });
  const settings = database.prepare("select store_full_url, store_page_title from user_settings where user_id = ?")
    .get(device.user_id) as { store_full_url: number; store_page_title: number } | undefined;
  const id = createId();

  database.prepare(
    `insert into activities (id, client_activity_id, user_id, device_id, session_id, url, domain, page_title,
      started_at, ended_at, duration_seconds, interaction_count, scroll_percentage)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     on conflict(device_id, client_activity_id) do nothing`,
  ).run(id, parsed.data.clientActivityId, device.user_id, device.id, parsed.data.sessionId,
    sanitizeUrl(parsed.data.url, Boolean(settings?.store_full_url)), parsed.data.domain,
    settings?.store_page_title === 0 ? null : parsed.data.pageTitle,
    parsed.data.startedAt, parsed.data.endedAt, parsed.data.durationSeconds,
    parsed.data.interactionCount, parsed.data.scrollPercentage);
  const stored = database.prepare("select id, analysis_status from activities where device_id = ? and client_activity_id = ?")
    .get(device.id, parsed.data.clientActivityId) as { id: string; analysis_status: string };
  database.prepare(
    `update tracking_sessions set total_activities = (select count(*) from activities where session_id = ?),
      active_duration_seconds = (select coalesce(sum(duration_seconds), 0) from activities where session_id = ?) where id = ?`,
  ).run(parsed.data.sessionId, parsed.data.sessionId, parsed.data.sessionId);
  return Response.json(stored, { status: stored.id === id ? 201 : 200 });
}

