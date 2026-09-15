import { accountVisits, requestUser } from "@/lib/account-auth";
import { accountDb } from "@/lib/account-db";
import { normalizePhone } from "@/lib/yandex-auth";
import { requestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store, private" } });
export async function GET(request: Request) {
  try {
    const user = requestUser(request);
    return user ? reply({ user, visits: accountVisits(user.id) }) : reply({ error: "Войдите в личный кабинет." }, 401);
  } catch { return reply({ error: "Личный кабинет временно недоступен." }, 503); }
}
export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== requestOrigin(request) || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Недопустимый запрос." }, 403);
  try {
    const user = requestUser(request);
    if (!user) return reply({ error: "Войдите в личный кабинет." }, 401);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Заполните профиль." }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength; if (size > 4096) { await reader.cancel(); return reply({ error: "Слишком большой запрос." }, 413); } chunks.push(chunk.value); }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return reply({ error: "Проверьте данные." }, 400); }
    if (!input || Array.isArray(input) || typeof input.fullname !== "string" || typeof input.email !== "string" || typeof input.phone !== "string" || input.phone.length > 25) return reply({ error: "Проверьте имя, почту и номер телефона." }, 400);
    const fullname = typeof input?.fullname === "string" ? input.fullname.trim() : "";
    const email = typeof input?.email === "string" ? input.email.trim() : "";
    const phone = typeof input?.phone === "string" ? normalizePhone(input.phone) : "";
    if (fullname.length < 2 || fullname.length > 100 || /[<>\x00-\x1f]/.test(fullname) || email.length > 150 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || (input?.phone && !phone)) return reply({ error: "Проверьте имя, почту и номер телефона." }, 400);
    accountDb().prepare("UPDATE users SET fullname=?,email=?,phone=? WHERE id=?").run(fullname, email, phone, user.id);
    return reply({ user: { ...user, fullname, email, phone } });
  } catch { return reply({ error: "Не удалось сохранить профиль." }, 503); }
}
