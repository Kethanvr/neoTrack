import { getDatabase } from "@/lib/database";
import { createAuthSession, setAuthCookie } from "@/lib/auth";
import { createId, hashPassword } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const data = Object.fromEntries(await request.formData());
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return NextResponse.redirect(new URL("/register?error=invalid", request.url), 303);

  const database = getDatabase();
  const existing = database.prepare("select id from users where email = ?").get(parsed.data.email);
  if (existing) return NextResponse.redirect(new URL("/register?error=exists", request.url), 303);

  const userId = createId();
  database.transaction(() => {
    database
      .prepare("insert into users (id, email, password_hash, full_name) values (?, ?, ?, ?)")
      .run(userId, parsed.data.email, hashPassword(parsed.data.password), parsed.data.name);
    database.prepare("insert into user_settings (user_id) values (?)").run(userId);
  })();

  const session = createAuthSession(userId);
  await setAuthCookie(session.token, session.expiresAt);
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}

