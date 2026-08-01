import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function createId() {
  return crypto.randomUUID();
}

export function createToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, storedDigest] = storedHash.split(":");
  if (!salt || !storedDigest) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedDigest, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

