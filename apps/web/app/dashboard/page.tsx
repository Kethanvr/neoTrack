import { requireUser } from "@/lib/auth";
import { formatDuration, getDashboard } from "@/lib/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requireUser();
  const requestedDate = (await searchParams).date;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate ?? "") ? requestedDate! : new Date().toISOString().slice(0, 10);
  const data = getDashboard(user.id, date);
  const top = data.categories[0]?.name ?? "—";
  const productivePercent = data.totalSeconds ? Math.round(data.productiveSeconds / data.totalSeconds * 100) : 0;

  return <>
    <header className="page-head"><div><div className="eyebrow">Local activity journal</div><h1>Good day, {user.full_name.split(" ")[0]}</h1><p>Here is what your browser activity looks like today.</p></div>
      <Link className="button" href="/dashboard/connect">Connect extension</Link></header>
    <section className="grid stats">
      <div className="card"><div className="card-title">Active time</div><div className="stat-value">{formatDuration(data.totalSeconds)}</div></div>
      <div className="card"><div className="card-title">Productive</div><div className="stat-value">{formatDuration(data.productiveSeconds)}</div></div>
      <div className="card"><div className="card-title">Activities</div><div className="stat-value">{data.activities.length}</div></div>
      <div className="card"><div className="card-title">Top category</div><div className="stat-value" style={{fontSize: 21}}>{top}</div></div>
    </section>
    <section className="grid two-col">
      <div className="card"><div className="section-title"><h2>Recent activity</h2><Link href="/dashboard/timeline" style={{color: "var(--green)", fontSize: 12}}>View timeline →</Link></div>
        <div className="timeline">{data.activities.length ? data.activities.slice(0, 7).map((activity) => <div className="activity" key={activity.id}>
          <div className="app-icon">{(activity.application_name ?? activity.domain)[0]?.toUpperCase()}</div><div><h3>{activity.activity_name ?? activity.page_title ?? "Unclassified activity"}</h3><p>{activity.application_name ?? activity.domain} · {new Date(activity.started_at).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} · {formatDuration(activity.duration_seconds)}</p></div><span className="pill">{activity.category ?? "Pending"}</span>
        </div>) : <div className="empty">No activity yet. Connect the extension and start a tracking session.</div>}</div>
      </div>
      <div className="card"><div className="section-title"><h2>Focus breakdown</h2><span className="pill">{productivePercent}% productive</span></div>
        {data.categories.length ? data.categories.slice(0, 6).map((category) => <div className="bar-row" key={category.name}><div className="bar-meta"><span>{category.name}</span><span>{formatDuration(category.seconds)}</span></div><div className="bar"><div style={{width: `${Math.round(category.seconds / data.totalSeconds * 100)}%`}} /></div></div>) : <div className="empty">Your category breakdown will appear here.</div>}
      </div>
    </section>
    <section className="card" style={{marginTop: 15}}><div className="card-title">Daily summary</div><p style={{fontSize: 17, marginBottom: 0}}>{data.dailySummary ?? "Analyze an activity to generate today’s private summary."}</p></section>
  </>;
}
