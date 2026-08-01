# NeoTrace AI

NeoTrace AI is a privacy-first Chrome activity journal. It records browser-tab metadata only after explicit consent, excludes idle time and sensitive pages, optionally classifies visible-tab screenshots with a local vision model, and presents the result in a local dashboard.

The development setup is fully local:

- Next.js dashboard and API on `http://localhost:3000`
- SQLite database stored under `apps/web/data/`
- screenshots stored temporarily under `apps/web/uploads/`
- cookie-based local accounts with hashed passwords
- optional Ollama vision analysis on `http://127.0.0.1:11434`
- Chrome extension events queued in `chrome.storage.local` while offline

## Repository layout

```text
apps/web        Dashboard, API, local auth, SQLite persistence
apps/extension Chrome Manifest V3 extension built with WXT
packages/shared Shared validation schemas and domain constants
docs            Architecture, privacy, API, and testing guides
t.txt           Original product specification
```

Detailed setup instructions will be added as each MVP service lands. Never commit `.env`, SQLite files, screenshots, session secrets, or device tokens.

