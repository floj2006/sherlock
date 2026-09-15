import { createHash } from "node:crypto";
import { BookingError, assertBookingSelection, bookingDates, bookingMasters, bookingServices, bookingSlots, checkAppointment, createAppointment } from "@/lib/booking-api";
import { validateBookingSubmission } from "@/lib/booking-submission";
import { reserveBooking, type BookingReceipt } from "@/lib/booking-store";
import { services } from "@/lib/site-data";
import { validServiceIds } from "@/lib/booking-types";
import { requestUser, storeAccountVisit } from "@/lib/account-auth";
import { requestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const messages: Record<string, string> = {
  UNAVAILABLE: "Не удалось связаться с системой записи. Попробуйте ещё раз или позвоните нам.",
  ACCESS_DENIED: "Онлайн-запись сейчас недоступна. Позвоните нам, чтобы выбрать время.",
  SELECTION_INVALID: "Не все выбранные услуги доступны у этого мастера. Измените выбор.",
  SLOT_TAKEN: "Это время уже занято. Выберите другое свободное время.",
  PRICE_CHANGED: "Стоимость изменилась. Обновите выбор мастера и проверьте новую цену.",
  PHONE_CONFIRMATION: "Для этого номера требуется подтверждение. Свяжитесь с барбершопом по телефону.",
  PHONE_INVALID: "Проверьте номер телефона.",
  REJECTED: "Запись не создана. Проверьте данные или свяжитесь с нами.",
};
function saveAccountHistory(receipt: BookingReceipt) {
  if (!receipt.account) return;
  try { storeAccountVisit(receipt.account.userId, receipt.account.visit); }
  catch { console.error("[account] Visit history sync deferred; confirmed receipt retained"); }
}
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const hasServices = query.has("serviceIds") || query.has("serviceId");
  const serviceIds = query.has("serviceIds") ? query.getAll("serviceIds").flatMap(value => value.split(",")).map(Number)
    : query.getAll("serviceId").map(Number);
  const staffId = Number(query.get("staffId"));
  const date = query.get("date");
  if ((hasServices && (!validServiceIds(serviceIds) || !serviceIds.every(id => services.some(service => service.yclientsServiceId === id))))
    || (query.has("serviceIds") && query.has("serviceId"))
    || (query.has("staffId") && (!Number.isSafeInteger(staffId) || staffId <= 0))
    || (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))) return reply({ error: "Некорректные параметры." }, 400);
  try {
    if (!hasServices) return reply({ services: await bookingServices() });
    if (!staffId) return reply({ masters: await bookingMasters(serviceIds) });
    const selection = await assertBookingSelection(serviceIds, staffId);
    const result = { ...selection, service: selection.services.length === 1 ? selection.services[0] : undefined };
    if (date) return reply({ ...result, slots: await bookingSlots(serviceIds, staffId, date) });
    return reply({ ...result, dates: await bookingDates(serviceIds, staffId) });
  } catch (error) {
    const known = error instanceof BookingError ? error : new BookingError("UNAVAILABLE");
    return reply({ error: messages[known.code] || messages.UNAVAILABLE, code: known.code }, known.status);
  }
}

const attempts = new Map<string, { count: number; expires: number }>();
export async function POST(request: Request) {
  if (request.headers.get("origin") !== requestOrigin(request) || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ state: "rejected", error: "Недопустимый запрос." }, 403);
  const ip = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0] || "local").digest("hex");
  const now = Date.now();
  for (const [key, item] of attempts) if (item.expires < now) attempts.delete(key);
  const limit = attempts.get(ip) ?? { count: 0, expires: now + 15 * 60_000 };
  attempts.set(ip, { ...limit, count: limit.count + 1 });
  if (limit.count >= 20) return reply({ state: "rejected", error: "Слишком много попыток. Попробуйте позже или позвоните нам." }, 429);
  let input;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ state: "rejected", error: "Заполните данные записи." }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) { await reader.cancel(); return reply({ state: "rejected", error: "Слишком большой запрос." }, 413); }
      chunks.push(chunk.value);
    }
    input = validateBookingSubmission(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch { return reply({ state: "rejected", error: "Проверьте данные записи." }, 400); }
  if (!input || !input.serviceIds.every(id => services.some(service => service.yclientsServiceId === id))) return reply({ state: "rejected", error: "Выберите услуги, заполните имя, телефон, почту и подтвердите согласие." }, 400);
  let reservation;
  let accountUser;
  try { accountUser = requestUser(request); reservation = await reserveBooking(input); }
  catch { return reply({ state: "rejected", error: messages.UNAVAILABLE }, 503); }
  if (reservation.previous) {
    if (reservation.previous.state === "confirmed") {
      // Reconcile to the original owner only, never to the account replaying a request.
      saveAccountHistory(reservation.previous);
      return reply({ state: "confirmed", recordId: reservation.previous.recordId });
    }
    return reply({ state: "unknown", error: "Запрос уже отправлен. Мы пока не получили подтверждение. Позвоните нам перед повторной записью." }, 202);
  }
  let sending = false;
  try {
    if (Date.parse(input.datetime) <= now || Date.parse(input.datetime) > now + 120 * 86400_000) throw new BookingError("SLOT_TAKEN", 409);
    const selection = await checkAppointment(input);
    sending = true;
    const recordId = await createAppointment(input);
    const receipt: BookingReceipt = { state: "confirmed", recordId, ...(accountUser ? { account: { userId: accountUser.id, visit: {
      recordId, datetime: input.datetime, services: selection.services.map(service => service.title), serviceSlugs: selection.services.map(service => service.slug),
      master: selection.master.name, priceMin: selection.totals.priceMin, priceMax: selection.totals.priceMax,
    } } } : {}) };
    await reservation.confirm!(receipt);
    saveAccountHistory(receipt);
    return reply({ state: "confirmed", recordId }, 201);
  } catch (error) {
    const definiteRejection = error instanceof BookingError && error.status >= 400 && error.status < 500;
    if (!sending || definiteRejection) {
      await reservation.reject!().catch(() => {});
      const known = error instanceof BookingError ? error : new BookingError("UNAVAILABLE");
      return reply({ state: "rejected", code: known.code, error: messages[known.code] || messages.UNAVAILABLE }, known.status);
    }
    return reply({ state: "unknown", error: "Запрос отправлен, но подтверждение ещё не получено. Позвоните нам перед повторной записью." }, 202);
  }
}
