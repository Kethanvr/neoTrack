import { requireUser } from "@/lib/auth";
import { formatDuration, getDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Timeline({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? "") ? query.date! : new Date().toISOString().slice(0, 10);
  const data = getDashboard(user.id, date);
  return <><header className="page-head"><div><div className="eyebrow">Activity history</div><h1>Timeline</h1><p>Every entry belongs to your local account and can be removed.</p></div><form><input type="date" name="date" defaultValue={date}/></form></header>
    <section className="card"><div className="timeline">{data.activities.length ? data.activities.map((activity) => <div className="activity" key={activity.id}>
      <div className="app-icon">{activity.domain[0]?.toUpperCase()}</div><div><h3>{activity.activity_name ?? activity.page_title ?? activity.domain}</h3><p>{new Date(activity.started_at).toLocaleString()} · {activity.domain} · {formatDuration(activity.duration_seconds)}</p></div>
      <form method="post" action={`/api/v1/activities/${activity.id}/delete`}><button className="button secondary" style={{padding: "7px 10px"}}>Delete</button></form>
    </div>) : <div className="empty">There are no activities for this date.</div>}</div></section></>;
}

