import { requireUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";

export const dynamic = "force-dynamic";

type Settings = {
  screenshot_enabled: number;
  capture_interval_seconds: number;
  idle_threshold_seconds: number;
  store_full_url: number;
  store_page_title: number;
  auto_delete_screenshots: number;
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { saved } = await searchParams;
  const database = getDatabase();
  const settings = database.prepare("select * from user_settings where user_id = ?").get(user.id) as Settings;
  const blocked = database.prepare("select id, domain, reason from blocked_domains where user_id = ? order by domain").all(user.id) as Array<{id:string;domain:string;reason:string|null}>;
  return <><header className="page-head"><div><div className="eyebrow">Your controls</div><h1>Privacy settings</h1><p>Changes are stored only in your local database.</p></div></header>
    {saved && <div className="pill" style={{display: "inline-block", marginBottom: 15}}>Settings saved</div>}
    <section className="grid two-col"><form className="card form-grid" method="post" action="/api/v1/settings"><h2>Tracking preferences</h2>
      <label className="consent"><input name="screenshotEnabled" type="checkbox" defaultChecked={Boolean(settings.screenshot_enabled)}/><span>Enable optional screenshot analysis</span></label>
      <label>Capture interval in seconds<input name="captureInterval" type="number" min="30" max="3600" defaultValue={settings.capture_interval_seconds}/></label>
      <label>Idle threshold in seconds<input name="idleThreshold" type="number" min="30" max="3600" defaultValue={settings.idle_threshold_seconds}/></label>
      <label className="consent"><input name="storeFullUrl" type="checkbox" defaultChecked={Boolean(settings.store_full_url)}/><span>Store URL query parameters (known secret fields are still redacted)</span></label>
      <label className="consent"><input name="storePageTitle" type="checkbox" defaultChecked={Boolean(settings.store_page_title)}/><span>Store page titles</span></label>
      <label className="consent"><input name="autoDelete" type="checkbox" defaultChecked={Boolean(settings.auto_delete_screenshots)}/><span>Delete screenshots immediately after analysis</span></label>
      <button className="button" type="submit">Save settings</button>
    </form>
    <div className="grid"><section className="card"><h2>Blocked domains</h2><form className="form-grid" method="post" action="/api/v1/blocked-domains"><label>Domain<input name="domain" placeholder="example.com" required/></label><label>Reason (optional)<input name="reason" placeholder="Private account"/></label><button className="button secondary">Block domain</button></form>
      <div style={{marginTop: 15}}>{blocked.map(item => <div className="mini-row" key={item.id}><div><strong>{item.domain}</strong><br/><small>{item.reason}</small></div><form method="post" action={`/api/v1/blocked-domains/${item.id}/delete`}><button className="button secondary" style={{padding: "7px 9px"}}>Remove</button></form></div>)}</div></section>
      <section className="card"><h2>Local data</h2><p style={{color: "var(--muted)"}}>Download a JSON copy or permanently delete activities, sessions, devices, and settings.</p><div style={{display:"flex", gap: 8}}><a className="button secondary" href="/api/v1/account/export">Export JSON</a><form method="post" action="/api/v1/account/data/delete"><button className="button danger">Delete all data</button></form></div></section>
    </div></section></>;
}

