import { services } from "./site-data";
import { normalizeMaster } from "./yclients-reviews";
import { bookingTotals, type BookingMaster, type BookingService, type BookingSlot, type BookingSubmission } from "./booking-types";

type Row = Record<string, unknown>;
const row = (value: unknown): value is Row => !!value && typeof value === "object" && !Array.isArray(value);
export class BookingError extends Error {
  constructor(public code: string, public status = 503) { super(code); }
}
function config() {
  const company = process.env.YCLIENTS_COMPANY_ID;
  const token = process.env.YCLIENTS_PARTNER_TOKEN?.replace(/^Bearer\s+/i, "").trim();
  if (!company || !/^[1-9]\d*$/.test(company) || !token) throw new BookingError("UNAVAILABLE");
  // Test overrides are allowed only outside production. Secrets stay on this server.
  const testBase = process.env.NODE_ENV !== "production" ? process.env.YCLIENTS_BOOKING_TEST_URL : undefined;
  return { company, token, base: testBase || "https://api.yclients.ru/api/v1" };
}
async function api(endpoint: string, query: Record<string, string | string[]> = {}, body?: unknown) {
  const { company, token, base } = config();
  const url = new URL(base + "/" + endpoint.replace(":company", company));
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) url.searchParams.append(key, item);
  }
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { Accept: "application/vnd.yclients.v2+json", "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
  });
  const raw = await response.text();
  const result: unknown = raw ? JSON.parse(raw) : {};
  if (!response.ok || (row(result) && result.success === false)) {
    const meta = row(result) && row(result.meta) ? result.meta : {};
    const errors = Array.isArray(meta.errors) ? meta.errors.filter(row).map(error => Number(error.code)) : [];
    if (errors.some(code => [433, 436, 437, 438].includes(code))) throw new BookingError("SLOT_TAKEN", 409);
    if (errors.includes(432)) throw new BookingError("PHONE_CONFIRMATION", 422);
    if (errors.includes(431)) throw new BookingError("PHONE_INVALID", 422);
    if (response.status === 401 || response.status === 403) throw new BookingError("ACCESS_DENIED", 403);
    if (response.status >= 400 && response.status < 500) throw new BookingError("REJECTED", 422);
    throw new BookingError("UNAVAILABLE");
  }
  return row(result) ? result.data : undefined;
}
export async function bookingServices(staffId?: number): Promise<BookingService[]> {
  const data = await api("book_services/:company", staffId ? { staff_id: String(staffId) } : {});
  if (!row(data) || !Array.isArray(data.services)) throw new BookingError("UNAVAILABLE");
  return data.services.filter(row).flatMap(item => {
    const saved = services.find(service => service.yclientsServiceId === Number(item.id));
    const min = Number(item.price_min), max = Number(item.price_max);
    // Native checkout currently supports services paid at the venue.
    if (!saved || Number(item.active) !== 1 || item.prepaid === "required" || !Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) return [];
    return [{ id: Number(item.id), slug: saved.slug, title: String(item.title || saved.title), category: saved.category, priceMin: min, priceMax: max,
      duration: Number(item.seance_length) > 0 ? Number(item.seance_length) : null }];
  });
}
export async function bookingMasters(serviceIds: number[]): Promise<BookingMaster[]> {
  const data = await api("book_staff/:company", { "service_ids[]": serviceIds.map(String) });
  if (!Array.isArray(data)) throw new BookingError("UNAVAILABLE");
  return data.map(normalizeMaster).flatMap(master => master && master.yclientsStaffId ? [{ id: master.yclientsStaffId, name: master.name, role: master.role, image: master.image }] : []);
}
export async function assertBookingSelection(serviceIds: number[], staffId: number) {
  const [masters, availableServices] = await Promise.all([bookingMasters(serviceIds), bookingServices(staffId)]);
  const selected = serviceIds.map(id => availableServices.find(item => item.id === id));
  const master = masters.find(item => item.id === staffId);
  if (selected.some(service => !service) || !master) throw new BookingError("SELECTION_INVALID", 422);
  const selectedServices = selected as BookingService[];
  return { services: selectedServices, totals: bookingTotals(selectedServices), master };
}
export async function bookingDates(serviceIds: number[], staffId: number): Promise<string[]> {
  const data = await api("book_dates/:company", { "service_ids[]": serviceIds.map(String), staff_id: String(staffId) });
  if (!row(data) || !Array.isArray(data.booking_dates)) throw new BookingError("UNAVAILABLE");
  return data.booking_dates.filter((date): date is string => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
}
export async function bookingSlots(serviceIds: number[], staffId: number, date: string): Promise<BookingSlot[]> {
  const data = await api(`book_times/:company/${staffId}/${date}`, { "service_ids[]": serviceIds.map(String) });
  if (!Array.isArray(data)) throw new BookingError("UNAVAILABLE");
  return data.filter(row).flatMap(item => typeof item.time === "string" && typeof item.datetime === "string" && Number.isFinite(Date.parse(item.datetime)) && Number(item.seance_length) > 0
    ? [{ time: item.time, datetime: item.datetime, duration: Number(item.seance_length) }] : []);
}
const appointment = (input: BookingSubmission) => ({ id: 1, services: input.serviceIds, staff_id: input.staffId, datetime: input.datetime });
export async function checkAppointment(input: BookingSubmission) {
  const selection = await assertBookingSelection(input.serviceIds, input.staffId);
  if (selection.totals.priceMin !== input.priceMin || selection.totals.priceMax !== input.priceMax) throw new BookingError("PRICE_CHANGED", 409);
  const slots = await bookingSlots(input.serviceIds, input.staffId, input.datetime.slice(0, 10));
  if (!slots.some(slot => slot.datetime === input.datetime)) throw new BookingError("SLOT_TAKEN", 409);
  await api("book_check/:company", {}, { appointments: [appointment(input)] });
  return selection;
}
export async function createAppointment(input: BookingSubmission) {
  const data = await api("book_record/:company", {}, {
    fullname: input.fullname, phone: input.phone, email: input.email,
    comment: ["Запись с сайта SHERLOCK", input.comment].filter(Boolean).join(". "),
    is_personal_data_processing_allowed: true, is_newsletter_allowed: false,
    appointments: [appointment(input)],
  });
  const record = Array.isArray(data) ? data.find(item => row(item) && Number(item.id) === 1) : undefined;
  if (!row(record) || !Number.isSafeInteger(Number(record.record_id)) || Number(record.record_id) <= 0) throw new BookingError("UNKNOWN");
  // The record hash is a management credential and never goes to the browser.
  return Number(record.record_id);
}
