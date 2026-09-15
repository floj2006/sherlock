import { validServiceIds, type BookingSubmission } from "./booking-types";

export function validateBookingSubmission(value: unknown): BookingSubmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  // Accept older single-service clients during a rolling deployment.
  const serviceIds = input.serviceIds ?? [input.serviceId];
  const string = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
  let phone = string("phone").replace(/[\s()+-]/g, "");
  if (/^8\d{10}$/.test(phone)) phone = "7" + phone.slice(1);
  if (/^\d{10}$/.test(phone)) phone = "7" + phone;
  const requestId = string("requestId"), fullname = string("fullname"), email = string("email"), datetime = string("datetime"), comment = string("comment");
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || fullname.length < 2 || fullname.length > 100 || /[<>\x00-\x1f]/.test(fullname)
    || !/^7\d{10}$/.test(phone) || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || comment.length > 500 || input.consent !== true
    || !validServiceIds(serviceIds) || !Number.isSafeInteger(input.staffId) || Number(input.staffId) <= 0
    || typeof input.priceMin !== "number" || typeof input.priceMax !== "number" || !Number.isFinite(input.priceMin) || !Number.isFinite(input.priceMax) || input.priceMin < 0 || input.priceMax < input.priceMin
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+03:00$/.test(datetime) || !Number.isFinite(Date.parse(datetime))) return null;
  return { requestId, fullname, phone, email, datetime, comment, consent: true, serviceIds: [...serviceIds].sort((a, b) => a - b), staffId: Number(input.staffId), priceMin: input.priceMin, priceMax: input.priceMax };
}
