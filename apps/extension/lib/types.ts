export type TrackingState = {
  tracking: boolean;
  consented: boolean;
  sessionId?: string;
  deviceId?: string;
  deviceToken?: string;
  apiBaseUrl: string;
  current?: LocalActivity;
  activityCount: number;
  startedAt?: string;
  statusMessage?: string;
};

export type LocalActivity = {
  clientActivityId: string;
  tabId: number;
  windowId: number;
  url?: string;
  domain: string;
  pageTitle?: string;
  startedAt: string;
  interactionCount: number;
  scrollPercentage: number;
};

export type PendingEvent = {
  id: string;
  attempts: number;
  nextRetryAt: number;
  payload: Record<string, unknown>;
};

export type PageSignals = {
  hasPasswordField: boolean;
  hasPaymentField: boolean;
  hasOneTimeCodeField: boolean;
  clickCount: number;
  scrollPercentage: number;
  documentVisibility: DocumentVisibilityState;
};

export const DEFAULT_STATE: TrackingState = {
  tracking: false,
  consented: false,
  apiBaseUrl: "http://localhost:3000",
  activityCount: 0,
};

