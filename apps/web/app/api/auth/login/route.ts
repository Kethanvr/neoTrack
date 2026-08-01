import { createAuthSession, setAuthCookie } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { verifyPassword } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({ email: z.email().toLowerCase(), password: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);

  const user = getDatabase()
    .prepare("select id, password_hash from users where email = ?")
    .get(parsed.data.email) as { id: string; password_hash: string } | undefined;
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  }

  const session = createAuthSession(user.id);
  await setAuthCookie(session.token, session.expiresAt);
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}

