import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="dashboard">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">N</span> NeoTrace</Link>
      <nav className="sidebar-nav">
        <Link href="/dashboard">⌂ &nbsp; Overview</Link>
        <Link href="/dashboard/timeline">◷ &nbsp; Timeline</Link>
        <Link href="/dashboard/connect">＋ &nbsp; Connect extension</Link>
        <Link href="/dashboard/settings">⚙ &nbsp; Privacy settings</Link>
      </nav>
      <div className="sidebar-footer">
        <strong style={{color: "var(--ink)"}}>{user.full_name}</strong><br/>{user.email}
        <form method="post" action="/api/auth/logout" style={{marginTop: 12}}><button className="button secondary" style={{padding: "7px 10px"}}>Sign out</button></form>
      </div>
    </aside>
    <main className="main">{children}</main>
  </div>;
}

