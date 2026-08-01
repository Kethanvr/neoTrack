import Link from "next/link";

export default function Privacy() {
  return <><header className="shell topbar"><Link href="/" className="brand"><span className="brand-mark">N</span> NeoTrace AI</Link><Link className="button secondary" href="/">Back home</Link></header>
    <main className="shell" style={{maxWidth: 800, padding: "70px 0"}}><div className="eyebrow">Privacy promise</div><h1 style={{fontSize: 48, letterSpacing: -2}}>You are the operator, not the product.</h1>
      <div className="panel" style={{padding: 30}}><h2>What is recorded</h2><p>After explicit consent and only while tracking is active, NeoTrace records active-tab domain, safe URL, page title, timestamps, duration, and privacy-safe interaction counts.</p>
      <h2>What is never recorded</h2><p>NeoTrace does not collect keystrokes, typed text, passwords, form values, clipboard data, microphone, webcam, incognito tabs, or unrelated desktop applications.</p>
      <h2>Screenshots</h2><p>Visible-tab screenshots are optional. Sensitive and blocked pages are excluded. Local analysis uses Ollama when configured, and screenshots are deleted immediately after analysis by default.</p>
      <h2>Your controls</h2><p>You can pause tracking, disable screenshots, block domains, remove individual activities, revoke devices, export your records, or permanently delete all local data.</p></div>
    </main></>;
}

