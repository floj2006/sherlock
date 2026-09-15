import { createHash, randomBytes, randomUUID } from "node:crypto";
import { accountDb } from "./account-db";
import type { AccountUser, AccountVisit } from "./account-types";

export const SESSION_COOKIE = "sherlock_session";
export const FLOW_COOKIE = "sherlock_oauth";
export const SESSION_AGE = 14 * 86400;
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");
const userFields = "id, fullname, email, phone, created_at AS createdAt";

export function readCookie(request: Request, name: string) {
  return request.headers.get("cookie")?.split(";").map(item => item.trim()).find(item => item.startsWith(name + "="))?.slice(name.length + 1) ?? "";
}
export function sessionCookie(request: Request, name: string, value: string, age: number) {
  const secure = new URL(request.url).protocol === "https:" || process.env.YANDEX_REDIRECT_URI?.startsWith("https:");
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? "; Secure" : ""}`;
}
export function userFromToken(token: string): AccountUser | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const db = accountDb();
  return db.prepare(`SELECT ${userFields.split(", ").map(field => "u." + field).join(", ")} FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.digest=? AND s.expires_at>?`).get(digest(token), Date.now()) as AccountUser | undefined ?? null;
}
export const requestUser = (request: Request) => userFromToken(readCookie(request, SESSION_COOKIE));
export function createSession(userId: string) {
  const db = accountDb();
  const token = randomToken();
  db.prepare("DELETE FROM sessions WHERE expires_at<=?").run(Date.now());
  db.prepare("INSERT INTO sessions (digest, user_id, expires_at) VALUES (?, ?, ?)").run(digest(token), userId, Date.now() + SESSION_AGE * 1000);
  return token;
}
export function revokeSession(token: string) { if (token) accountDb().prepare("DELETE FROM sessions WHERE digest=?").run(digest(token)); }

export function findOrCreateUser(yandexId: string, profile: Omit<AccountUser, "id" | "createdAt">): AccountUser {
  const db = accountDb();
  return db.transaction(() => {
    // Identity comes only from Yandex. Matching email/phone never links accounts.
    const existing = db.prepare(`SELECT ${userFields} FROM users WHERE yandex_id=?`).get(yandexId) as AccountUser | undefined;
    if (existing) return existing;
    const user = { ...profile, id: randomUUID(), createdAt: Date.now() };
    db.prepare("INSERT INTO users (id,yandex_id,fullname,email,phone,created_at) VALUES (?,?,?,?,?,?)").run(user.id, yandexId, user.fullname, user.email, user.phone, user.createdAt);
    return user;
  })();
}

export function allowedAuthAttempt(request: Request, action: string) {
  const db = accountDb();
  // Forwarded headers are trusted only when the deployment explicitly enables it.
  const ip = process.env.AUTH_TRUST_PROXY === "1" ? request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown" : "shared";
  const key = digest(action + ":" + ip);
  return db.transaction(() => {
    db.prepare("DELETE FROM auth_limits WHERE expires_at<=?").run(Date.now());
    const limit = db.prepare("SELECT count FROM auth_limits WHERE key=?").get(key) as { count: number } | undefined;
    if (limit && limit.count >= 60) return false;
    db.prepare("INSERT INTO auth_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1").run(key, Date.now() + 15 * 60_000);
    return true;
  })();
}

export function storeAccountVisit(userId: string, visit: AccountVisit) {
  accountDb().prepare("INSERT INTO account_visits (record_id,user_id,datetime,services,service_slugs,master,price_min,price_max) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(record_id) DO NOTHING")
    .run(visit.recordId, userId, visit.datetime, JSON.stringify(visit.services), JSON.stringify(visit.serviceSlugs), visit.master, visit.priceMin, visit.priceMax);
}
export function accountVisits(userId: string): AccountVisit[] {
  const rows = accountDb().prepare("SELECT record_id AS recordId, datetime, services, service_slugs AS serviceSlugs, master, price_min AS priceMin, price_max AS priceMax FROM account_visits WHERE user_id=? ORDER BY datetime DESC LIMIT 100").all(userId) as (Omit<AccountVisit, "services" | "serviceSlugs"> & { services: string; serviceSlugs: string })[];
  return rows.map(row => ({ ...row, services: JSON.parse(row.services), serviceSlugs: JSON.parse(row.serviceSlugs) }));
}
