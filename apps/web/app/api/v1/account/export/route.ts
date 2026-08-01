import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const database = getDatabase();
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: user,
    devices: database.prepare("select id, name, browser, extension_version, last_seen_at, revoked_at, created_at from devices where user_id = ?").all(user.id),
    sessions: database.prepare("select * from tracking_sessions where user_id = ?").all(user.id),
    activities: database.prepare("select * from activities where user_id = ?").all(user.id),
    settings: database.prepare("select * from user_settings where user_id = ?").get(user.id),
    blockedDomains: database.prepare("select domain, reason, created_at from blocked_domains where user_id = ?").all(user.id),
  };
  return new Response(JSON.stringify(payload, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="neotrace-export-${Date.now()}.json"` } });
}

