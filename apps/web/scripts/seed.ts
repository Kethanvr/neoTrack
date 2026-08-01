import { getDatabase } from "../lib/database";
import { createId, hashPassword, hashToken } from "../lib/security";

const database = getDatabase();
const email = "demo@neotrace.local";
const existing = database.prepare("select id from users where email = ?").get(email) as { id: string } | undefined;

if (existing) {
  console.log("Demo data already exists.");
  process.exit(0);
}

const userId = createId();
const deviceId = createId();
const sessionId = createId();
const now = new Date();
const samples = [
  ["github.com", "Reviewing source code", "GitHub", "Software Development", "productive", 2520],
  ["developer.mozilla.org", "Reading API documentation", "MDN", "Documentation", "productive", 1680],
  ["mail.google.com", "Responding to project email", "Gmail", "Communication", "neutral", 840],
] as const;

database.transaction(() => {
  database.prepare("insert into users (id, email, password_hash, full_name) values (?, ?, ?, ?)")
    .run(userId, email, hashPassword("demo1234"), "Demo User");
  database.prepare("insert into user_settings (user_id) values (?)").run(userId);
  database.prepare("insert into devices (id, user_id, name, device_token_hash, last_seen_at) values (?, ?, ?, ?, ?)")
    .run(deviceId, userId, "Demo Chrome", hashToken("demo-device-token"), now.toISOString());
  database.prepare("insert into tracking_sessions (id, user_id, device_id, started_at, status) values (?, ?, ?, ?, 'completed')")
    .run(sessionId, userId, deviceId, new Date(now.getTime() - 6_000_000).toISOString());
  for (const [index, sample] of samples.entries()) {
    const [domain, activityName, applicationName, category, productivityLevel, durationSeconds] = sample;
    const started = new Date(now.getTime() - (index + 1) * 2_000_000);
    database.prepare(
      `insert into activities (id, client_activity_id, user_id, device_id, session_id, url, domain, page_title,
       started_at, ended_at, duration_seconds, category, activity_name, summary, application_name,
       productivity_level, confidence, analysis_status, sensitivity_level)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'low')`,
    ).run(createId(), `demo-${index}`, userId, deviceId, sessionId, `https://${domain}/`, domain, activityName,
      started.toISOString(), new Date(started.getTime() + durationSeconds * 1000).toISOString(), durationSeconds,
      category, activityName, `${activityName} on ${domain}.`, applicationName, productivityLevel, 0.9);
  }
})();

console.log("Demo account created:");
console.log("  email: demo@neotrace.local");
console.log("  password: demo1234");

