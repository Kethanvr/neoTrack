import { describe, expect, it } from "vitest";
import { checkPageSignals, checkUrl } from "./privacy-filter";

describe("privacy filter", () => {
  it("rejects browser pages and configured domains", () => {
    expect(checkUrl("chrome://settings", []).safe).toBe(false);
    expect(checkUrl("https://private.example.com/a", ["example.com"]).safe).toBe(false);
  });

  it("allows ordinary HTTPS pages", () => {
    expect(checkUrl("https://github.com/openai/codex", [])).toEqual({ safe: true, domain: "github.com" });
  });

  it("rejects password and payment fields", () => {
    const base = { hasPasswordField: false, hasPaymentField: false, hasOneTimeCodeField: false, clickCount: 0, scrollPercentage: 0, documentVisibility: "visible" as const };
    expect(checkPageSignals({ ...base, hasPasswordField: true }).safe).toBe(false);
    expect(checkPageSignals({ ...base, hasPaymentField: true }).safe).toBe(false);
  });
});

