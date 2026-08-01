import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, verifyPassword } from "./security";

describe("local credentials", () => {
  it("hashes and verifies passwords without storing plaintext", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse");
    expect(verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("creates deterministic token hashes", () => {
    expect(hashToken("device-token")).toBe(hashToken("device-token"));
    expect(hashToken("other-token")).not.toBe(hashToken("device-token"));
  });
});

