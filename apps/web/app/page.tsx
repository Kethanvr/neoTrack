import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return <>
    <header className="shell topbar">
      <Link href="/" className="brand"><span className="brand-mark">N</span> NeoTrace AI</Link>
      <nav className="nav">
        <Link href="/privacy">Privacy</Link>
        <Link className="button" href={user ? "/dashboard" : "/login"}>{user ? "Open dashboard" : "Get started"}</Link>
      </nav>
    </header>
    <main className="shell hero">
      <section>
        <div className="eyebrow">Private by design · Local by default</div>
        <h1>Understand your work, <span>without surrendering it.</span></h1>
        <p>NeoTrace turns browser activity into a useful timeline. You control when tracking runs, which sites are blocked, and whether screenshots ever leave your machine.</p>
        <div className="hero-actions">
          <Link className="button" href={user ? "/dashboard" : "/register"}>Start locally</Link>
          <Link className="button secondary" href="/privacy">See privacy controls</Link>
        </div>
        <div className="privacy-note">◉ SQLite on your computer · no cloud account required</div>
      </section>
      <aside className="preview" aria-label="Activity timeline preview">
        <div className="preview-inner">
          <div className="section-title"><h2>Today&apos;s focus</h2><span className="pill">● Tracking active</span></div>
          <div className="mini-row"><div><strong>GitHub</strong><br/><small>Reviewing source code</small></div><span>42m</span></div>
          <div className="mini-row"><div><strong>Documentation</strong><br/><small>Reading API reference</small></div><span>28m</span></div>
          <div className="mini-row"><div><strong>Gmail</strong><br/><small>Responding to project email</small></div><span>14m</span></div>
          <div className="mini-row"><div><strong>Sensitive page</strong><br/><small>Capture automatically excluded</small></div><span className="pill">Blocked</span></div>
        </div>
      </aside>
    </main>
  </>;
}

