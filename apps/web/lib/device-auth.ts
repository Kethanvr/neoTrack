import { getDatabase } from "./database";
import { hashToken } from "./security";

export type DeviceAuth = { id: string; user_id: string; name: string };

export function authenticateDevice(request: Request): DeviceAuth | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Device ")) return null;
  const token = authorization.slice(7).trim();
  if (!token) return null;
  const database = getDatabase();
  const device = database.prepare(
    "select id, user_id, name from devices where device_token_hash = ? and revoked_at is null",
  ).get(hashToken(token)) as DeviceAuth | undefined;
  if (device) database.prepare("update devices set last_seen_at = ? where id = ?").run(new Date().toISOString(), device.id);
  return device ?? null;
}

export function deviceUnauthorized() {
  return Response.json({ error: "A valid, non-revoked device token is required." }, { status: 401 });
}

