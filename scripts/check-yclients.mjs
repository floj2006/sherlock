// Read-only integration check. Never prints credentials or raw API responses.
const company = process.env.YCLIENTS_COMPANY_ID?.trim();
const partner = process.env.YCLIENTS_PARTNER_TOKEN?.replace(/^Bearer\s+/i, "").trim();
const user = process.env.YCLIENTS_USER_TOKEN?.replace(/^User\s+/i, "").trim();
const missing = [];
if (!company || !/^[1-9]\d*$/.test(company)) missing.push("YCLIENTS_COMPANY_ID");
if (!partner) missing.push("YCLIENTS_PARTNER_TOKEN");
console.log("Филиал:", company && /^[1-9]\d*$/.test(company) ? company : "не указан");
console.log("Партнёрский токен:", partner ? "заполнен" : "не заполнен");
console.log("Пользовательский токен:", user ? "заполнен" : "не заполнен");

if (missing.length) {
  console.log("Запросы не отправлены. Заполните:", missing.join(", "));
  process.exitCode = 1;
} else {
  const base = new URL(process.env.YCLIENTS_API_URL || "https://api.yclients.ru/api/v1");
  if (base.protocol !== "https:" || !["api.yclients.ru", "api.yclients.com"].includes(base.hostname) || base.username || base.password || base.port) {
    console.log("Проверка остановлена: ожидается официальный HTTPS-адрес API YCLIENTS.");
    process.exitCode = 1;
  } else {
    async function check(path, withUser = false) {
      try {
        const response = await fetch(base.href.replace(/\/$/, "") + "/" + path, {
          headers: { Accept: "application/vnd.yclients.v2+json", "Content-Type": "application/json", Authorization: "Bearer " + partner + (withUser ? ", User " + user : "") },
          signal: AbortSignal.timeout(10000), redirect: "error",
        });
        if (!response.ok) {
          console.log("HTTP", response.status, withUser ? "при чтении отзывов" : "при чтении мастеров");
          console.log(response.status === 401 ? "Проверьте тип и актуальность токенов." : response.status === 403 ? "Проверьте доступ интеграции и пользователя к филиалу." : "Проверьте ID филиала и доступность API.");
          process.exitCode = 1;
          return null;
        }
        const body = await response.json();
        if (body.success !== true || !Array.isArray(body.data)) {
          console.log("API вернул неожиданный формат данных.");
          process.exitCode = 1;
          return null;
        }
        return body.data;
      } catch {
        console.log("Не удалось выполнить запрос: сеть, таймаут или перенаправление. Токены не выводятся.");
        process.exitCode = 1;
        return null;
      }
    }
    const staff = await check("book_staff/" + company);
    if (staff) {
      console.log("Мастеров получено:", staff.length);
      for (const person of staff) {
        const score = Number(person.rating);
        const votes = Number(person.votes_count);
        const visible = Number(person.show_rating) === 1;
        const comments = Number(person.comments_count);
        console.log(JSON.stringify({ staffId: person.id, showRating: visible, rating: Number.isFinite(score) ? score : null, votes: Number.isSafeInteger(votes) ? votes : null, comments: Number.isSafeInteger(comments) ? comments : null }));
      }
      if (user) {
        const reviews = await check("comments/" + company + "/?count=1", true);
        if (reviews) console.log("Чтение отзывов доступно. Тексты и данные гостей не выводятся.");
      } else console.log("Для текстов отзывов дополнительно заполните YCLIENTS_USER_TOKEN.");
    }
  }
}
