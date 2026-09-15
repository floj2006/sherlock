"use client";
import { useEffect } from "react";
import { business } from "@/lib/site-data";

export default function ErrorPage({ error, retry }: {
  error: Error & { digest?: string }; retry: () => void;
}) {
  useEffect(() => { console.error("[page-error]", error.digest ?? "client-error"); }, [error]);
  return (
    <section className="section-shell py-36">
      <h1 className="font-display text-4xl">Не удалось открыть страницу</h1>
      <p className="mt-5 max-w-lg leading-7 text-muted">Попробуйте ещё раз. Если нужна запись, откройте нашу карточку на Яндекс Картах.</p>
      <div className="mt-7 flex flex-wrap gap-4">
        <button type="button" onClick={() => retry()} className="rounded-full bg-metal px-6 py-3 font-semibold text-ink">Повторить</button>
        <a href={business.mapUrl} className="rounded-full border border-line px-6 py-3">Контакты на Яндекс Картах</a>
      </div>
    </section>
  );
}
