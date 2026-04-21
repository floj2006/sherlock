"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ClickAnalytics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const analyticsNode = target.closest<HTMLElement>("[data-analytics-event]");

      if (!analyticsNode) {
        return;
      }

      trackEvent({
        event: analyticsNode.dataset.analyticsEvent ?? "interaction",
        label: analyticsNode.dataset.analyticsLabel,
        value: analyticsNode.dataset.analyticsValue,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
