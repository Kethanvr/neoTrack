import { requireUser } from "@/lib/auth";
import { getDatabase } from "@/lib/database";

export const dynamic = "force-dynamic";

export default async function Connect({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const user = await requireUser();
  const { code } = await searchParams;
  const devices = getDatabase().prepare("select id, name, last_seen_at, revoked_at, created_at from devices where user_id = ? order by created_at desc").all(user.id) as Array<{id:string; name:string; last_seen_at:string|null; revoked_at:string|null; created_at:string}>;
  return <><header className="page-head"><div><div className="eyebrow">Chrome extension</div><h1>Connect a device</h1><p>Pairing codes expire after five minutes and can be used once.</p></div></header>
    <section className="grid two-col"><div className="card"><h2>Generate pairing code</h2><p style={{color: "var(--muted)"}}>Open the extension popup, choose Connect, and enter this code.</p>
      {code ? <div style={{fontSize: 48, letterSpacing: 10, fontWeight: 900, color: "var(--green)", margin: "25px 0"}}>{code}</div> : <form method="post" action="/api/v1/pairing-codes"><button className="button">Generate code</button></form>}
    </div><div className="card"><h2>Connected devices</h2>{devices.length ? devices.map(device => <div className="mini-row" key={device.id}><div><strong>{device.name}</strong><br/><small>{device.revoked_at ? "Revoked" : `Last seen ${device.last_seen_at ?? "never"}`}</small></div>{!device.revoked_at && <form method="post" action={`/api/v1/devices/${device.id}/revoke`}><button className="button secondary" style={{padding: "7px 9px"}}>Revoke</button></form>}</div>) : <div className="empty">No extension connected yet.</div>}</div></section>
  </>;
}

