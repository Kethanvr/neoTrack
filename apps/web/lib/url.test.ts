import { describe, expect, it } from "vitest";
import { sanitizeUrl } from "./url";

describe("sanitizeUrl", () => {
  it("removes query parameters and fragments by default", () => {
    expect(sanitizeUrl("https://example.com/work?document=private#section"))
      .toBe("https://example.com/work");
  });

  it("redacts known secret parameters in full URL mode", () => {
    expect(sanitizeUrl("https://example.com/?page=2&token=secret", true))
      .toBe("https://example.com/?page=2&token=%5Bredacted%5D");
  });

  it("rejects malformed URLs", () => {
    expect(sanitizeUrl("not a url")).toBeUndefined();
  });
});

