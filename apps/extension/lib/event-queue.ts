import { submitActivity } from "./api-client";
import { getQueue, getState, setQueue } from "./storage";
import type { PendingEvent } from "./types";

const RETRY_DELAYS = [0, 10_000, 30_000, 120_000, 600_000];

export async function enqueue(payload: Record<string, unknown>) {
  const queue = await getQueue();
  queue.push({ id: crypto.randomUUID(), attempts: 0, nextRetryAt: Date.now(), payload });
  await setQueue(queue);
}

export async function flushQueue() {
  const state = await getState();
  if (!state.deviceToken) return;
  const queue = await getQueue();
  const remaining: PendingEvent[] = [];
  for (const event of queue) {
    if (event.nextRetryAt > Date.now()) { remaining.push(event); continue; }
    try { await submitActivity(state, event.payload); }
    catch {
      const attempts = event.attempts + 1;
      const delay = RETRY_DELAYS[Math.min(attempts, RETRY_DELAYS.length - 1)] ?? 600_000;
      remaining.push({ ...event, attempts, nextRetryAt: Date.now() + delay });
    }
  }
  await setQueue(remaining);
}

