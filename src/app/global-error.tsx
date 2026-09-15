"use client";
import { business } from "@/lib/site-data";
export default function GlobalError() {
  return <html lang="ru"><body style={{ margin: 0, background: "#0C2B25", color: "#f2eee8", fontFamily: "sans-serif" }}>
    <main style={{ maxWidth: 620, padding: "80px 24px", margin: "auto" }}>
      <h1>Не удалось загрузить сайт</h1>
      <p>Обновите страницу или свяжитесь с нами для записи.</p>
      <button onClick={() => window.location.reload()} style={{ padding: 14, marginRight: 20 }}>Обновить страницу</button>
      <a href={business.mapUrl} style={{ color: "#d2b374" }}>Контакты на Яндекс Картах</a>
    </main>
  </body></html>;
}
