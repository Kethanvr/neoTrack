# Privacy and security model

Tracking begins only after an account is paired, the disclosure is shown, the user confirms consent, and Chrome grants optional website access. A visible badge shows when tracking is active. Pause ends the current activity immediately.

NeoTrace excludes Chrome internal pages, incognito tabs, user-blocked domains, common banking/authentication/health domains, pages with password fields, payment fields, or one-time-code fields, and pages not currently visible.

It does not collect keystrokes, input values, clipboard data, microphone, webcam, full desktop images, or activity in other applications. The content script never reads form values.

Local data locations are:

```text
apps/web/data/neotrace.sqlite
apps/web/uploads/screenshots/<user-id>/
Chrome extension storage (device token, settings, pending events)
```

Passwords use salted scrypt hashes. Dashboard sessions and device credentials are random opaque tokens stored as hashes. Device tokens can be revoked from the dashboard. User ownership is included in every dashboard database mutation; device ownership is included in every extension mutation.

The application is local by default, but browser activity remains sensitive. Use a strong operating-system login, full-disk encryption, and a dedicated browser profile. Do not expose the development server to a public network.

