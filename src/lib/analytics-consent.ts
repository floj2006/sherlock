export type AnalyticsConsent = "granted" | "denied" | null;
const key = "sherlock-analytics-consent";
export const consentEvent = "sherlock:analytics-consent";
export const preferencesEvent = "sherlock:analytics-preferences";
let memoryConsent: AnalyticsConsent = null;
export function readConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    return stored === "granted" || stored === "denied" ? stored : memoryConsent;
  } catch { return memoryConsent; }
}
export function saveConsent(value: Exclude<AnalyticsConsent, null>) {
  memoryConsent = value;
  try { localStorage.setItem(key, value); } catch { /* Works for this page if storage is unavailable. */ }
  window.dispatchEvent(new Event(consentEvent));
}
export function subscribeConsent(callback: () => void) {
  window.addEventListener(consentEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
