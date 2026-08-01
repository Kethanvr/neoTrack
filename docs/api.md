# Local API reference

The default base URL is `http://localhost:3000`. Dashboard endpoints use the HTTP-only browser session cookie. Extension endpoints use:

```http
Authorization: Device <device-token>
```

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public form | Create a local account |
| POST | `/api/auth/login` | Public form | Start a dashboard session |
| POST | `/api/v1/pairing-codes` | Dashboard | Generate a five-minute code |
| POST | `/api/v1/devices/pair` | Pairing code | Create a revocable device |
| POST | `/api/v1/sessions` | Device | Start tracking |
| PATCH | `/api/v1/sessions/:id` | Device owner | Pause or complete tracking |
| POST | `/api/v1/activities` | Device | Idempotently ingest an event |
| POST | `/api/v1/activities/:id/analyze` | Device owner | Analyze a validated screenshot |
| POST | `/api/v1/activities/:id/delete` | Dashboard owner | Delete one activity |
| GET | `/api/v1/account/export` | Dashboard | Download local JSON data |
| POST | `/api/v1/account/data/delete` | Dashboard | Delete the local account and data |

`clientActivityId` plus device ID is unique, so offline retries do not duplicate activity records. URLs have fragments and query parameters removed by default. When full URL storage is enabled, known credential parameter names are replaced with `[redacted]`.

Example activity request:

```json
{
  "clientActivityId": "84bfd772-a9f7-46ac-9780-135f3b878d25",
  "sessionId": "395052b7-559d-46e1-8946-a7e504019da2",
  "url": "https://github.com/example/project?token=secret",
  "domain": "github.com",
  "pageTitle": "Example project",
  "startedAt": "2026-08-01T10:20:00.000Z",
  "endedAt": "2026-08-01T10:23:20.000Z",
  "durationSeconds": 200,
  "interactionCount": 8,
  "scrollPercentage": 62
}
```

