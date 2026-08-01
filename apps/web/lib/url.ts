const SECRET_QUERY_NAMES = new Set(["token", "code", "key", "password", "secret", "auth", "session"]);

export function sanitizeUrl(value: string | undefined, storeFullUrl = false) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    url.hash = "";
    if (!storeFullUrl) url.search = "";
    else for (const key of [...url.searchParams.keys()]) {
      if (SECRET_QUERY_NAMES.has(key.toLowerCase())) url.searchParams.set(key, "[redacted]");
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

