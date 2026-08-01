import { getDatabase } from "./database";
import { createId } from "./security";

export function refreshDailySummary(userId: string, date: string) {
  const database = getDatabase();
  const activities = database.prepare(
    `select category, productivity_level, duration_seconds from activities
     where user_id = ? and substr(started_at, 1, 10) = ?`,
  ).all(userId, date) as Array<{category:string|null; productivity_level:string; duration_seconds:number}>;
  const seconds = (level?: string) => activities.filter(item => !level || item.productivity_level === level).reduce((sum, item) => sum + item.duration_seconds, 0);
  const categoryTotals = new Map<string, number>();
  for (const item of activities) categoryTotals.set(item.category ?? "Unclassified", (categoryTotals.get(item.category ?? "Unclassified") ?? 0) + item.duration_seconds);
  const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, durationSeconds]) => ({ category, durationSeconds }));
  const summary = activities.length
    ? `Recorded ${activities.length} activities. Most time was spent on ${topCategories[0]?.category ?? "uncategorized work"}.`
    : "No browser activity was recorded for this day.";
  database.prepare(
    `insert into daily_summaries (id, user_id, summary_date, total_active_seconds, productive_seconds, neutral_seconds, distracting_seconds, top_categories, ai_summary, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     on conflict(user_id, summary_date) do update set total_active_seconds=excluded.total_active_seconds,
       productive_seconds=excluded.productive_seconds, neutral_seconds=excluded.neutral_seconds,
       distracting_seconds=excluded.distracting_seconds, top_categories=excluded.top_categories,
       ai_summary=excluded.ai_summary, updated_at=excluded.updated_at`,
  ).run(createId(), userId, date, seconds(), seconds("productive"), seconds("neutral"), seconds("distracting"), JSON.stringify(topCategories), summary, new Date().toISOString());
}

