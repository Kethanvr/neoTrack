import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { createId, hashToken } from "@/lib/security";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const code = randomInt(100_000, 1_000_000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  const database = getDatabase();
  database.prepare("delete from pairing_codes where user_id = ? or expires_at <= ?").run(user.id, new Date().toISOString());
  database.prepare("insert into pairing_codes (id, user_id, code_hash, expires_at) values (?, ?, ?, ?)")
    .run(createId(), user.id, hashToken(code), expiresAt);
  return NextResponse.redirect(new URL(`/dashboard/connect?code=${code}`, request.url), 303);
}

