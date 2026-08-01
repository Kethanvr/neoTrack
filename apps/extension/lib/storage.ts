import { browser } from "wxt/browser";
import { DEFAULT_STATE, type PendingEvent, type TrackingState } from "./types";

const STATE_KEY = "neotraceState";
const QUEUE_KEY = "pendingEvents";
const BLOCKED_KEY = "blockedDomains";

export async function getState(): Promise<TrackingState> {
  const result = await browser.storage.local.get(STATE_KEY);
  return { ...DEFAULT_STATE, ...(result[STATE_KEY] as Partial<TrackingState> | undefined) };
}

export async function setState(state: TrackingState) {
  await browser.storage.local.set({ [STATE_KEY]: state });
}

export async function patchState(patch: Partial<TrackingState>) {
  const state = { ...(await getState()), ...patch };
  await setState(state);
  return state;
}

export async function getQueue(): Promise<PendingEvent[]> {
  const result = await browser.storage.local.get(QUEUE_KEY);
  return (result[QUEUE_KEY] as PendingEvent[] | undefined) ?? [];
}

export async function setQueue(queue: PendingEvent[]) {
  await browser.storage.local.set({ [QUEUE_KEY]: queue.slice(-500) });
}

export async function getBlockedDomains(): Promise<string[]> {
  const result = await browser.storage.local.get(BLOCKED_KEY);
  return (result[BLOCKED_KEY] as string[] | undefined) ?? [];
}

export async function setBlockedDomains(domains: string[]) {
  await browser.storage.local.set({ [BLOCKED_KEY]: domains.map((item) => item.trim().toLowerCase()).filter(Boolean) });
}

