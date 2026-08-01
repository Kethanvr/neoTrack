# Testing guide

Run automated checks first:

```bash
npm run typecheck
npm test
npm run build
```

Manual Chrome MVP checklist:

1. Seed the database, start the dashboard, and sign in.
2. Build and load the unpacked extension.
3. Generate a pairing code and connect the extension.
4. Start tracking and approve optional host permission.
5. Switch between two ordinary HTTPS tabs and navigate within one tab.
6. Minimize Chrome, restore it, become idle, and become active again.
7. Stop the Next.js server, switch tabs, restart the server, and verify queued events drain.
8. Open a login page and verify the popup reports that capture was skipped.
9. Add a blocked domain in dashboard settings and verify it is excluded.
10. Select **Analyze current page** and verify a structured result appears in the timeline.
11. Pause tracking and confirm the badge disappears.
12. Delete an activity, export JSON, and revoke the device.

For a clean repeatable run, use `npm run db:reset`. This deletes current local records before restoring the demo account.

