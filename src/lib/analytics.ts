declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

type TrackPayload = {
  event: string;
  label?: string;
  value?: string;
};

export function trackEvent({ event, label, value }: TrackPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("event", event, {
    event_label: label,
    value,
  });

  const ymId = process.env.NEXT_PUBLIC_YM_ID;
  if (ymId) {
    window.ym?.(Number(ymId), "reachGoal", event, {
      label,
      value,
    });
  }
}
