import { authenticateDevice, deviceUnauthorized } from "@/lib/device-auth";
import { getDatabase } from "@/lib/database";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["active", "paused", "completed", "interrupted"]),
  endedAt: z.iso.datetime().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const device = authenticateDevice(request);
  if (!device) return deviceUnauthorized();
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid session update." }, { status: 400 });
  const { sessionId } = await params;
  const result = getDatabase().prepare(
    "update tracking_sessions set status = ?, ended_at = coalesce(?, ended_at) where id = ? and device_id = ?",
  ).run(parsed.data.status, parsed.data.endedAt ?? null, sessionId, device.id);
  if (!result.changes) return Response.json({ error: "Session not found." }, { status: 404 });
  return Response.json({ id: sessionId, ...parsed.data });
}

