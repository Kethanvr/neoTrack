import type { PageSignals } from "./types";

const INTERNAL_PROTOCOLS = new Set(["chrome:", "chrome-extension:", "edge:", "about:", "file:", "view-source:"]);
const SENSITIVE_HOST_PARTS = [
  "bank", "payment", "checkout", "wallet", "password", "auth", "login",
  "signin", "medical", "health", "identity", "aadhaar", "passport",
];

export type PrivacyDecision = { safe: true; domain: string } | { safe: false; reason: string };

export function checkUrl(urlValue: string | undefined, blockedDomains: string[]): PrivacyDecision {
  if (!urlValue) return { safe: false, reason: "Page URL is unavailable" };
  try {
    const url = new URL(urlValue);
    if (INTERNAL_PROTOCOLS.has(url.protocol)) return { safe: false, reason: "Internal browser page excluded" };
    const domain = url.hostname.toLowerCase();
    if (blockedDomains.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`))) {
      return { safe: false, reason: "Domain is on your block list" };
    }
    if (SENSITIVE_HOST_PARTS.some((part) => domain.includes(part))) {
      return { safe: false, reason: "Potentially sensitive website excluded" };
    }
    return { safe: true, domain };
  } catch {
    return { safe: false, reason: "Unsupported page URL" };
  }
}

export function checkPageSignals(signals: PageSignals | null): PrivacyDecision {
  if (!signals) return { safe: false, reason: "Page permission is not available" };
  if (signals.hasPasswordField) return { safe: false, reason: "Password field detected" };
  if (signals.hasPaymentField) return { safe: false, reason: "Payment field detected" };
  if (signals.hasOneTimeCodeField) return { safe: false, reason: "Authentication code field detected" };
  if (signals.documentVisibility !== "visible") return { safe: false, reason: "Page is not visible" };
  return { safe: true, domain: "" };
}

