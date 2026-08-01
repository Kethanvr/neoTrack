import { authenticateDevice, deviceUnauthorized } from "@/lib/device-auth";
import { getDatabase } from "@/lib/database";
import { createId } from "@/lib/security";
import { z } from "zod";

const sessionSchema = z.object({ startedAt: z.iso.datetime() });

export async function POST(request: Request) {
  const device = authenticateDevice(request);
  if (!device) return deviceUnauthorized();
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid session payload." }, { status: 400 });
  const id = createId();
  getDatabase().prepare(
    "insert into tracking_sessions (id, user_id, device_id, started_at) values (?, ?, ?, ?)",
  ).run(id, device.user_id, device.id, parsed.data.startedAt);
  return Response.json({ id, status: "active", startedAt: parsed.data.startedAt }, { status: 201 });
}

