import type { PageSignals } from "../lib/types";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    let clickCount = 0;
    let scrollPercentage = 0;
    document.addEventListener("click", () => { clickCount += 1; }, { passive: true });
    document.addEventListener("scroll", () => {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollPercentage = Math.max(scrollPercentage, Math.min(100, Math.round(window.scrollY / available * 100)));
    }, { passive: true });

    browser.runtime.onMessage.addListener((message: unknown) => {
      if ((message as { type?: string })?.type !== "GET_PAGE_SIGNALS") return;
      const signals: PageSignals = {
        hasPasswordField: Boolean(document.querySelector('input[type="password"]')),
        hasPaymentField: Boolean(document.querySelector('input[autocomplete^="cc-"]')),
        hasOneTimeCodeField: Boolean(document.querySelector('input[autocomplete="one-time-code"]')),
        clickCount,
        scrollPercentage,
        documentVisibility: document.visibilityState,
      };
      return Promise.resolve(signals);
    });
  },
});

