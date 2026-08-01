import { browser } from "wxt/browser";
import { analyzeScreenshot, startSession, submitActivity, updateSession } from "../lib/api-client";
import { enqueue, flushQueue } from "../lib/event-queue";
import { checkPageSignals, checkUrl } from "../lib/privacy-filter";
import { getBlockedDomains, getState, patchState, setState } from "../lib/storage";
import type { LocalActivity, PageSignals, TrackingState } from "../lib/types";

const RETRY_ALARM = "neotrace-retry";
const CAPTURE_ALARM = "neotrace-capture";

async function readSignals(tabId: number): Promise<PageSignals | null> {
  try { return await browser.tabs.sendMessage(tabId, { type: "GET_PAGE_SIGNALS" }) as PageSignals; }
  catch { return null; }
}

async function beginActivity(tab?: Browser.tabs.Tab) {
  const state = await getState();
  if (!state.tracking || !tab?.id || !tab.active || tab.incognito) return;
  const decision = checkUrl(tab.url, await getBlockedDomains());
  if (!decision.safe) {
    await patchState({ current: undefined, statusMessage: decision.reason });
    return;
  }
  const signals = await readSignals(tab.id);
  const current: LocalActivity = {
    clientActivityId: crypto.randomUUID(), tabId: tab.id, windowId: tab.windowId,
    url: tab.url, domain: decision.domain, pageTitle: tab.title,
    startedAt: new Date().toISOString(), interactionCount: signals?.clickCount ?? 0,
    scrollPercentage: signals?.scrollPercentage ?? 0,
  };
  await patchState({ current, statusMessage: undefined });
}

function activityPayload(state: TrackingState, activity: LocalActivity, signals: PageSignals | null) {
  const endedAt = new Date();
  return {
    clientActivityId: activity.clientActivityId,
    sessionId: state.sessionId,
    url: activity.url,
    domain: activity.domain,
    pageTitle: activity.pageTitle,
    startedAt: activity.startedAt,
    endedAt: endedAt.toISOString(),
    durationSeconds: Math.max(0, Math.round((endedAt.getTime() - new Date(activity.startedAt).getTime()) / 1000)),
    interactionCount: signals?.clickCount ?? activity.interactionCount,
    scrollPercentage: signals?.scrollPercentage ?? activity.scrollPercentage,
  };
}

async function finishActivity(analyze = false) {
  const state = await getState();
  if (!state.current || !state.sessionId) return;
  const signals = await readSignals(state.current.tabId);
  const payload = activityPayload(state, state.current, signals);
  let activityId: string | undefined;
  try { activityId = (await submitActivity(state, payload)).id; }
  catch { await enqueue(payload); }

  if (analyze && activityId) {
    const signalDecision = checkPageSignals(signals);
    if (!signalDecision.safe) await patchState({ statusMessage: signalDecision.reason });
    else {
      try {
        const screenshot = await browser.tabs.captureVisibleTab(state.current.windowId, { format: "jpeg", quality: 72 });
        await analyzeScreenshot(state, activityId, screenshot);
        await patchState({ statusMessage: "Page analyzed locally" });
      } catch (error) {
        await patchState({ statusMessage: error instanceof Error ? error.message : "Analysis failed" });
      }
    }
  }
  await patchState({ current: undefined, activityCount: state.activityCount + 1 });
}

async function switchTo(tab?: Browser.tabs.Tab, analyzePrevious = false) {
  await finishActivity(analyzePrevious);
  await beginActivity(tab);
}

async function activeTab() {
  return (await browser.tabs.query({ active: true, lastFocusedWindow: true }))[0];
}

async function startTracking() {
  let state = await getState();
  if (!state.consented) throw new Error("Consent is required before tracking starts");
  if (!state.deviceToken) throw new Error("Connect this extension to your local dashboard first");
  const session = await startSession(state);
  state = { ...state, tracking: true, sessionId: session.id, startedAt: new Date().toISOString(), activityCount: 0, statusMessage: "Tracking active" };
  await setState(state);
  await browser.action.setBadgeText({ text: "ON" });
  await browser.action.setBadgeBackgroundColor({ color: "#36c98f" });
  await beginActivity(await activeTab());
}

async function pauseTracking() {
  await finishActivity();
  const state = await getState();
  try { await updateSession(state, "paused"); } catch { /* retry is not needed for local pause */ }
  await patchState({ tracking: false, current: undefined, statusMessage: "Tracking paused" });
  await browser.action.setBadgeText({ text: "" });
  await flushQueue();
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    await browser.alarms.create(RETRY_ALARM, { periodInMinutes: 1 });
    await browser.alarms.create(CAPTURE_ALARM, { periodInMinutes: 1 });
  });
  browser.runtime.onStartup.addListener(async () => {
    await browser.alarms.create(RETRY_ALARM, { periodInMinutes: 1 });
    const state = await getState();
    if (state.tracking) {
      await patchState({ tracking: false, current: undefined, statusMessage: "Tracking paused after browser restart" });
      await browser.action.setBadgeText({ text: "" });
    }
  });
  browser.tabs.onActivated.addListener(async ({ tabId }) => { await switchTo(await browser.tabs.get(tabId)); });
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const state = await getState();
    if (state.tracking && tab.active && state.current?.tabId === tabId && changeInfo.url) await switchTo(tab);
  });
  browser.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) await finishActivity();
    else await beginActivity(await activeTab());
  });
  browser.idle.onStateChanged.addListener(async (idleState) => {
    if (idleState === "active") await beginActivity(await activeTab());
    else await finishActivity();
  });
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === RETRY_ALARM) await flushQueue();
    if (alarm.name === CAPTURE_ALARM && (await getState()).tracking) await switchTo(await activeTab(), true);
  });
  browser.runtime.onMessage.addListener((message: unknown) => {
    const type = (message as { type?: string }).type;
    if (type === "START_TRACKING") return startTracking().then(() => ({ ok: true })).catch((error: Error) => ({ ok: false, error: error.message }));
    if (type === "PAUSE_TRACKING") return pauseTracking().then(() => ({ ok: true }));
    if (type === "ANALYZE_NOW") return switchTo(undefined, true).then(async () => { await beginActivity(await activeTab()); return { ok: true }; });
  });
});

