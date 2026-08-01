import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { createId } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";

const domainSchema = z.object({ domain: z.string().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/), reason: z.string().trim().max(200).optional() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const parsed = domainSchema.safeParse(Object.fromEntries(await request.formData()));
  if (parsed.success) getDatabase().prepare("insert or ignore into blocked_domains (id, user_id, domain, reason) values (?, ?, ?, ?)")
    .run(createId(), user.id, parsed.data.domain, parsed.data.reason || null);
  return NextResponse.redirect(new URL("/dashboard/settings", request.url), 303);
}

