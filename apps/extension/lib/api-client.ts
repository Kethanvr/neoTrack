import type { TrackingState } from "./types";

async function deviceRequest<T>(state: TrackingState, path: string, init: RequestInit = {}): Promise<T> {
  if (!state.deviceToken) throw new Error("Extension is not connected");
  const response = await fetch(`${state.apiBaseUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Device ${state.deviceToken}`, ...init.headers },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? `Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function pairDevice(apiBaseUrl: string, pairingCode: string, deviceName: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/devices/pair`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pairingCode, deviceName, extensionVersion: "0.1.0" }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "Pairing failed");
  return response.json() as Promise<{ deviceId: string; deviceToken: string }>;
}

export function startSession(state: TrackingState) {
  return deviceRequest<{ id: string }>(state, "/api/v1/sessions", { method: "POST", body: JSON.stringify({ startedAt: new Date().toISOString() }) });
}

export function updateSession(state: TrackingState, status: "paused" | "completed" | "interrupted") {
  if (!state.sessionId) return Promise.resolve();
  return deviceRequest(state, `/api/v1/sessions/${state.sessionId}`, { method: "PATCH", body: JSON.stringify({ status, endedAt: new Date().toISOString() }) });
}

export function submitActivity(state: TrackingState, payload: Record<string, unknown>) {
  return deviceRequest<{ id: string }>(state, "/api/v1/activities", { method: "POST", body: JSON.stringify(payload) });
}

export async function analyzeScreenshot(state: TrackingState, activityId: string, screenshot: string) {
  if (!state.deviceToken) throw new Error("Extension is not connected");
  const blob = await (await fetch(screenshot)).blob();
  const form = new FormData();
  form.append("screenshot", blob, "visible-tab.jpg");
  const response = await fetch(`${state.apiBaseUrl}/api/v1/activities/${activityId}/analyze`, {
    method: "POST", headers: { authorization: `Device ${state.deviceToken}` }, body: form,
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "Analysis failed");
  return response.json();
}

