import { getDatabase } from "@/lib/database";
import { createId, createToken, hashToken } from "@/lib/security";
import { z } from "zod";

const pairSchema = z.object({
  pairingCode: z.string().regex(/^\d{6}$/),
  deviceName: z.string().trim().min(2).max(100),
  extensionVersion: z.string().max(30).optional(),
});

export async function POST(request: Request) {
  const parsed = pairSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid pairing request." }, { status: 400 });
  const database = getDatabase();
  const pairing = database.prepare(
    "select id, user_id from pairing_codes where code_hash = ? and used_at is null and expires_at > ?",
  ).get(hashToken(parsed.data.pairingCode), new Date().toISOString()) as { id: string; user_id: string } | undefined;
  if (!pairing) return Response.json({ error: "Pairing code is invalid or expired." }, { status: 401 });

  const deviceId = createId();
  const deviceToken = createToken();
  database.transaction(() => {
    database.prepare(
      "insert into devices (id, user_id, name, device_token_hash, extension_version, last_seen_at) values (?, ?, ?, ?, ?, ?)",
    ).run(deviceId, pairing.user_id, parsed.data.deviceName, hashToken(deviceToken), parsed.data.extensionVersion, new Date().toISOString());
    database.prepare("update pairing_codes set used_at = ? where id = ?").run(new Date().toISOString(), pairing.id);
  })();
  return Response.json({ deviceId, deviceToken });
}

