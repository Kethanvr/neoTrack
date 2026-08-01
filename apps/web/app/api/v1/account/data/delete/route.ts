import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";
import { rmSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  getDatabase().prepare("delete from users where id = ?").run(user.id);
  const root = path.resolve(process.cwd(), process.env.SCREENSHOT_DIR ?? "./uploads/screenshots");
  rmSync(path.join(root, user.id), { recursive: true, force: true });
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/?deleted=1", request.url), 303);
}

