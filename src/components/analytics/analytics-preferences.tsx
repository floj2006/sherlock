"use client";
import { preferencesEvent } from "@/lib/analytics-consent";
export function AnalyticsPreferences() {
  if (!process.env.NEXT_PUBLIC_GA_ID && !process.env.NEXT_PUBLIC_YM_ID) return null;
  return <button type="button" className="text-left hover:text-cream" onClick={() => window.dispatchEvent(new Event(preferencesEvent))}>Настройки аналитики</button>;
}
