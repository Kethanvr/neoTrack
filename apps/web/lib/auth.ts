import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "./database";
import { createId, createToken, hashToken } from "./security";

const COOKIE_NAME = "neotrace_session";
const SESSION_DAYS = 14;

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  timezone: string;
};

export function createAuthSession(userId: string) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  getDatabase()
    .prepare("insert into auth_sessions (id, user_id, token_hash, expires_at) values (?, ?, ?, ?)")
    .run(createId(), userId, hashToken(token), expiresAt.toISOString());
  return { token, expiresAt };
}

export async function setAuthCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  return (
    getDatabase()
      .prepare(
        `select users.id, users.email, users.full_name, users.timezone
         from auth_sessions join users on users.id = auth_sessions.user_id
         where auth_sessions.token_hash = ? and auth_sessions.expires_at > ?`,
      )
      .get(hashToken(token), new Date().toISOString()) as AuthUser | undefined
  ) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

