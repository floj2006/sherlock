"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { readConsent, saveConsent, subscribeConsent, preferencesEvent } from "@/lib/analytics-consent";
import { AnalyticsScripts } from "./analytics-scripts";

export function AnalyticsGate() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const analyticsLoaded = useRef(false);
  useEffect(() => {
    if (consent === "granted") analyticsLoaded.current = true;
    else if (analyticsLoaded.current) window.location.reload();
  }, [consent]);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_YM_ID);
  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(preferencesEvent, open);
    return () => window.removeEventListener(preferencesEvent, open);
  }, []);
  if (!configured) return null;
  const choose = (value: "granted" | "denied") => {
    const wasGranted = consent === "granted";
    saveConsent(value);
    setPreferencesOpen(false);
    // Reload removes already loaded third-party scripts after withdrawal.
    if (wasGranted && value === "denied") window.location.reload();
  };
  return <>
    {consent === "granted" ? <AnalyticsScripts /> : null}
    {consent === null || preferencesOpen ? <section aria-label="Настройки аналитики"
      className="fixed inset-x-4 bottom-28 z-40 max-w-md rounded-2xl border border-line bg-noir p-5 shadow-xl sm:left-6 sm:right-auto lg:bottom-6">
      <p className="text-sm leading-6 text-cream">Разрешить аналитику посещений? Она помогает улучшать сайт. Запись работает при любом выборе.</p>
      <Link href="/privacy" className="mt-2 inline-flex min-h-11 items-center text-sm text-metal-soft underline">О данных и cookies</Link>
      <div className="mt-3 flex flex-wrap gap-3">
        <button className="min-h-11 rounded-full border border-line px-4 text-sm text-cream" onClick={() => choose("denied")}>Отклонить</button>
        <button className="min-h-11 rounded-full border border-line px-4 text-sm text-cream" onClick={() => choose("granted")}>Разрешить</button>
      </div>
    </section> : null}
  </>;
}
