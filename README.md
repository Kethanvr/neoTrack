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

## Run everything locally

Requirements: Node.js 22 or newer, npm, Google Chrome, and optionally [Ollama](https://ollama.com/) for visual classification.

```bash
npm install
npm run db:seed
npm run dev
```

Open `http://localhost:3000` and sign in with the seeded demo account:

```text
Email: demo@neotrace.local
Password: demo1234
```

You can instead register your own local account. To remove the demo and rebuild an empty database:

```bash
npm run db:reset
```

`db:reset` intentionally deletes the local SQLite file and local screenshots, then recreates demo data. Do not run it if you need the existing activity records.

## Load the Chrome extension

```bash
npm run build --workspace @neotrace/extension
```

Then visit `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select:

```text
apps/extension/.output/chrome-mv3
```

In the dashboard, open **Connect extension**, generate a pairing code, and enter it in the popup. Review the disclosure and select **I understand — start tracking**. The extension requests website access at this point rather than during installation.

The dashboard must remain available at `http://localhost:3000` while tracking. Events are queued in Chrome local storage during temporary outages and retried later.

## Optional local visual AI

Metadata tracking and rule-based classification work without a model. For screenshot-aware analysis, run Ollama and install a vision model:

```bash
ollama pull llava:7b
ollama serve
```

Override the endpoint or model through `OLLAMA_BASE_URL` and `OLLAMA_VISION_MODEL`. Screenshots are written with owner-only permissions and deleted after analysis by default. No cloud AI key is used.

## Verify the project

```bash
npm run typecheck
npm test
npm run build
```

See [architecture](docs/architecture.md), [API reference](docs/api.md), [privacy model](docs/privacy.md), and the [manual Chrome test checklist](docs/testing.md).

## Git history

Development is split across feature branches and merged with `--no-ff`. Keep merge commits when publishing:

```bash
git log --graph --oneline --all
git push -u origin main
```

Never commit `.env`, SQLite files, screenshots, session secrets, pairing codes, or device tokens.

