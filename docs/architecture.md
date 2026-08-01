# Architecture

NeoTrace is a local-first monorepo with three boundaries:

```text
Chrome extension
  events + optional visible-tab image
          |
          v
Next.js route handlers on localhost:3000
  local auth | device auth | validation | analysis
          |
          +----> SQLite: apps/web/data/neotrace.sqlite
          |
          +----> Ollama: 127.0.0.1:11434 (optional)
```

The Chrome extension is a Manifest V3 application built with WXT. Its service worker listens to tab activation, navigation, window focus, idle-state, and alarms. It persists the active state and a capped offline queue in `chrome.storage.local`; it never updates the database every second. Durations are derived from start and end timestamps.

The content script returns only boolean sensitive-field signals, click count, maximum scroll percentage, and document visibility. It does not read input values or typed text.

The Next.js application provides the dashboard and `/api/v1` contract. Browser users authenticate with an opaque, HTTP-only local session cookie. The extension authenticates with a revocable random device token; only its SHA-256 hash is stored. SQLite enables foreign keys and WAL mode and initializes the schema on first use.

Visual analysis runs only for an already-ingested activity owned by the requesting device. Images are limited to JPEG, PNG, or WebP under 4 MB. The server attempts local Ollama classification, validates the JSON result, and uses a conservative domain classifier if Ollama is unavailable. Screenshots are deleted immediately unless the user explicitly disables automatic deletion; high-sensitivity images are always deleted.

