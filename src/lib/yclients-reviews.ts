import { cache } from "react";
import { masters as savedMasters, type Master, type Review } from "./site-data";

type Row = Record<string, unknown>;
const isRow = (value: unknown): value is Row => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => typeof value === "string" ? value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : "";
const integer = (value: unknown) => {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : undefined;
};
const rating = (value: unknown) => {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 && number <= 5 ? number : undefined;
};
function imageUrl(value: unknown) {
  try { const url = new URL(text(value)); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
}
function authorization(withUser = false) {
  const partner = (process.env.YCLIENTS_PARTNER_TOKEN || process.env.YCLIENTS_PUBLIC_WIDGET_TOKEN)?.replace(/^Bearer\s+/i, "").trim();
  if (!partner) return null;
  const user = process.env.YCLIENTS_USER_TOKEN?.replace(/^User\s+/i, "").trim();
  if (withUser && !user) return null;
  return "Bearer " + partner + (withUser ? ", User " + user : "");
}
export function isYclientsConfigured() {
  return Boolean(authorization()) && /^[1-9]\d*$/.test(process.env.YCLIENTS_COMPANY_ID ?? "");
}
async function request(path: string, query?: Record<string, string>, withUser = false): Promise<unknown> {
  const auth = authorization(withUser);
  if (!auth) throw new Error("YCLIENTS_NOT_CONFIGURED");
  const base = process.env.YCLIENTS_API_URL ?? "https://api.yclients.ru/api/v1";
  const url = new URL(base.replace(/\/$/, "") + "/" + path);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { Accept: "application/vnd.yclients.v2+json", "Content-Type": "application/json", Authorization: auth }, signal: AbortSignal.timeout(5000), next: { revalidate: 300, tags: ["yclients"] } });
  if (!response.ok) { console.error("[yclients] HTTP", response.status); throw new Error("YCLIENTS_UNAVAILABLE"); }
  const payload: unknown = await response.json();
  if (!isRow(payload) || payload.success === false) throw new Error("YCLIENTS_INVALID_RESPONSE");
  return payload.data;
}
export function normalizeMaster(value: unknown): Master | null {
  if (!isRow(value)) return null;
  const id = integer(value.id);
  const name = text(value.name);
  if (!id || !name || value.fired === true || Number(value.fired) === 1 || value.hidden === true || Number(value.hidden) === 1) return null;
  const position = isRow(value.position) ? text(value.position.title) : "";
  if (/^алина(?:\s|$)/iu.test(name) || /администратор/iu.test(position + " " + text(value.specialization))) return null;
  const score = rating(value.rating);
  const count = integer(value.comments_count);
  const votes = integer(value.votes_count);
  const saved = savedMasters.find(master => master.yclientsStaffId === id);
  const specialization = text(value.specialization);
  const description = text(value.information || value.description || value.staff_info);
  const specializationList = Array.isArray(value.services) ? value.services.filter(isRow).map((item) => text(item.title)).filter(Boolean) : [];
  return {
    slug: String(id), yclientsStaffId: id, name, role: specialization || saved?.role || "Мастер",
    focus: saved?.focus || specialization, summary: description || saved?.summary || "", initials: name.split(" ").map((part) => part[0]).slice(0, 2).join(""),
    specialties: specializationList.length ? specializationList : saved?.specialties ?? [],
    strengths: saved?.strengths,
    rating: score ?? 0, reviewCount: count ?? 0, voteCount: votes ?? 0,
    // The live booking API can return a rating and comments with votes_count = 0.
    // Visibility and the API's rating are authoritative; counters are separate.
    statsVerified: Number(value.show_rating) === 1 && score !== undefined,
    statsSource: "yclients",
    bookable: typeof value.bookable === "boolean" ? value.bookable : undefined,
    image: imageUrl(value.avatar_big || value.avatar || value.image) || saved?.image || "",
    reviews: [],
  };
}
const savedProfiles = () => savedMasters.filter(master => master.yclientsStaffId).map(master => ({ ...master, slug: String(master.yclientsStaffId), statsVerified: false, statsSource: "saved" as const, bookable: undefined, scheduleTill: undefined, reviews: [] }));
export type MastersSnapshot = { status: "ready" | "unconfigured" | "unavailable"; masters: Master[] };
export const getMastersSnapshot = cache(async (): Promise<MastersSnapshot> => {
  if (!isYclientsConfigured()) return { status: "unconfigured", masters: savedProfiles() };
  try {
    const endpoint = "book_staff";
    const data = await request(endpoint + "/" + process.env.YCLIENTS_COMPANY_ID);
    if (!Array.isArray(data)) throw new Error("YCLIENTS_INVALID_STAFF");
    return { status: "ready", masters: data.map(normalizeMaster).filter((master): master is Master => master !== null) };
  } catch { return { status: "unavailable", masters: savedProfiles() }; }
});
export async function getMastersWithYclientsStats() {
  return (await getMastersSnapshot()).masters;
}
export async function getYclientsMasterBySlug(slug: string) {
  const legacyIds: Record<string, string> = { erdni: "4817964", vyacheslav: "4974092", maksim: "5096424" };
  const id = legacyIds[slug] ?? slug;
  return (await getMastersSnapshot()).masters.find((master) => master.slug === id);
}
export async function getYclientsReviews(options: { staffId?: number; limit?: number } = {}): Promise<Review[]> {
  if (!isYclientsConfigured()) return [];
  try {
    const data = await request("comments/" + process.env.YCLIENTS_COMPANY_ID + "/", { count: "100", ...(options.staffId ? { staff_id: String(options.staffId) } : {}) }, true);
    if (!Array.isArray(data)) return [];
    return data.filter(isRow).filter((item) => text(item.text)).map((item): Review => ({
      name: text(item.user_name || item.name) || "Гость", text: text(item.text), source: "YCLIENTS", verified: true,
      rating: rating(item.rating), date: text(item.date) || undefined, staffId: integer(item.master_id), externalId: integer(item.id),
    })).slice(0, Math.max(1, Math.min(30, options.limit ?? 6)));
  } catch { return []; }
}
export async function getYclientsMasterProfile(master: Master, limit = 6) {
  return { master, reviews: await getYclientsReviews({ staffId: master.yclientsStaffId, limit }) };
}
