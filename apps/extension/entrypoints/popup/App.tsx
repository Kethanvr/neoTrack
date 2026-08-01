import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { pairDevice } from "../../lib/api-client";
import { getQueue, getState, patchState } from "../../lib/storage";
import type { TrackingState } from "../../lib/types";

function elapsed(start?: string) {
  if (!start) return "00:00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function App() {
  const [state, setLocalState] = useState<TrackingState>();
  const [queueSize, setQueueSize] = useState(0);
  const [pairingCode, setPairingCode] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:3000");
  const [error, setError] = useState("");
  const [, tick] = useState(0);

  const refresh = async () => { setLocalState(await getState()); setQueueSize((await getQueue()).length); };
  useEffect(() => { void refresh(); const timer = setInterval(() => tick((value) => value + 1), 1000); return () => clearInterval(timer); }, []);

  async function connect() {
    setError("");
    try {
      const device = await pairDevice(apiBaseUrl.replace(/\/$/, ""), pairingCode, `${navigator.platform || "Chrome"} browser`);
      await patchState({ apiBaseUrl: apiBaseUrl.replace(/\/$/, ""), deviceId: device.deviceId, deviceToken: device.deviceToken });
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Pairing failed"); }
  }

  async function start() {
    setError("");
    const granted = await browser.permissions.request({ origins: ["http://*/*", "https://*/*"], permissions: ["scripting"] });
    if (!granted) return setError("Website permission is required for visual tracking.");
    await patchState({ consented: true });
    const result = await browser.runtime.sendMessage({ type: "START_TRACKING" }) as { ok: boolean; error?: string };
    if (!result.ok) setError(result.error ?? "Could not start tracking");
    await refresh();
  }

  async function command(type: string) { await browser.runtime.sendMessage({ type }); await refresh(); }
  if (!state) return <main className="popup"><p>Loading…</p></main>;

  if (!state.deviceToken) return <main className="popup">
    <header><div className="logo">N</div><div><strong>NeoTrace AI</strong><small>Local connection</small></div></header>
    <section className="connect"><h1>Connect your dashboard</h1><p>Generate a six-digit code at <b>Dashboard → Connect extension</b>.</p>
      <label>Local dashboard URL<input value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)}/></label>
      <label>Pairing code<input inputMode="numeric" maxLength={6} placeholder="000000" value={pairingCode} onChange={(event) => setPairingCode(event.target.value.replace(/\D/g, ""))}/></label>
      {error && <div className="error">{error}</div>}<button onClick={connect} disabled={pairingCode.length !== 6}>Connect extension</button>
    </section></main>;

  return <main className="popup"><header><div className="logo">N</div><div><strong>NeoTrace AI</strong><small>{state.tracking ? "● Tracking active" : "Tracking paused"}</small></div><span className={state.tracking ? "live" : "paused"}>{state.tracking ? "LIVE" : "OFF"}</span></header>
    <section className="current"><small>CURRENT ACTIVITY</small><h1>{state.current?.domain ?? "Nothing being recorded"}</h1><p>{state.current?.pageTitle ?? state.statusMessage ?? "Start tracking when you are ready."}</p></section>
    <section className="metrics"><div><span>Session time</span><strong>{elapsed(state.startedAt)}</strong></div><div><span>Activities</span><strong>{state.activityCount}</strong></div><div><span>Queued</span><strong>{queueSize}</strong></div></section>
    {error && <div className="error">{error}</div>}{state.statusMessage && <div className="notice">{state.statusMessage}</div>}
    {state.tracking ? <><button className="pause" onClick={() => command("PAUSE_TRACKING")}>Pause tracking</button><button className="secondary" onClick={() => command("ANALYZE_NOW")}>Analyze current page</button></> : <button onClick={start}>I understand — start tracking</button>}
    <footer><a href={`${state.apiBaseUrl}/dashboard`} target="_blank">Open dashboard ↗</a><span>Local & private</span></footer>
  </main>;
}

