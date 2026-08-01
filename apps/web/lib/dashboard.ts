import { getDatabase } from "./database";

export type ActivityRow = {
  id: string;
  domain: string;
  page_title: string | null;
  activity_name: string | null;
  application_name: string | null;
  category: string | null;
  productivity_level: string;
  duration_seconds: number;
  started_at: string;
};

export function getDashboard(userId: string, date: string) {
  const database = getDatabase();
  const dayStart = `${date}T00:00:00.000Z`;
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const activities = database.prepare(
    `select id, domain, page_title, activity_name, application_name, category,
            productivity_level, duration_seconds, started_at
     from activities where user_id = ? and started_at >= ? and started_at < ?
     order by started_at desc limit 100`,
  ).all(userId, dayStart, nextDay.toISOString()) as ActivityRow[];

  const totalSeconds = activities.reduce((total, item) => total + item.duration_seconds, 0);
  const productiveSeconds = activities
    .filter((item) => item.productivity_level === "productive")
    .reduce((total, item) => total + item.duration_seconds, 0);
  const categoryMap = new Map<string, number>();
  for (const activity of activities) {
    const category = activity.category ?? "Unclassified";
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + activity.duration_seconds);
  }
  const categories = [...categoryMap.entries()]
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((a, b) => b.seconds - a.seconds);

  return { activities, totalSeconds, productiveSeconds, categories };
}

export function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

