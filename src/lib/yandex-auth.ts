import { createHash, randomBytes } from "node:crypto";
import { accountDb } from "./account-db";
import { digest, randomToken } from "./account-auth";

export function yandexConfig() {
  const clientId = process.env.YANDEX_CLIENT_ID?.trim();
  const secret = process.env.YANDEX_CLIENT_SECRET?.trim();
  const redirectUri = process.env.YANDEX_REDIRECT_URI?.trim();
  if (!clientId || !secret || !redirectUri) return null;
  try {
    const url = new URL(redirectUri);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/api/auth/yandex/callback") return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return null;
    return { clientId, secret, redirectUri, origin: url.origin };
  } catch { return null; }
}

export function safeReturnPath(value: string | null) {
  try {
    const url = new URL(value || "/account", "https://sherlock.invalid");
    if (url.origin !== "https://sherlock.invalid" || !["/account", "/book"].includes(url.pathname)) return "/account";
    const query = new URLSearchParams();
    if (url.pathname === "/book") for (const key of ["service", "services", "master"]) for (const item of url.searchParams.getAll(key)) if (item.length < 1000) query.append(key, item);
    return url.pathname + (query.size ? "?" + query : "");
  } catch { return "/account"; }
}

export type OAuthIntent = { verifier: string; nextPath: string };
export function accountErrorPath(error: string, next: string | null = null) {
  const query = new URLSearchParams({ error });
  const nextPath = safeReturnPath(next);
  if (nextPath !== "/account") query.set("next", nextPath);
  return "/account?" + query;
}

export function beginYandexLogin(next: string | null) {
  const config = yandexConfig();
  if (!config) throw new Error("not_configured");
  const state = randomToken(), binding = randomToken(), verifier = randomBytes(48).toString("base64url");
  const db = accountDb();
  db.prepare("DELETE FROM oauth_intents WHERE expires_at<=?").run(Date.now());
  db.prepare("INSERT INTO oauth_intents (state_hash,binding_hash,verifier,next_path,expires_at) VALUES (?,?,?,?,?)").run(digest(state), digest(binding), verifier, safeReturnPath(next), Date.now() + 600_000);
  const url = new URL("https://oauth.yandex.ru/authorize");
  url.search = new URLSearchParams({ response_type: "code", client_id: config.clientId, redirect_uri: config.redirectUri,
    scope: "login:info login:email", optional_scope: "login:default_phone", state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256",
  }).toString();
  return { url: url.toString(), binding };
}

export function consumeYandexIntent(state: string, binding: string): OAuthIntent | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(binding)) return null;
  return accountDb().prepare("DELETE FROM oauth_intents WHERE state_hash=? AND binding_hash=? AND expires_at>? RETURNING verifier,next_path AS nextPath")
    .get(digest(state), digest(binding), Date.now()) as OAuthIntent | undefined ?? null;
}

export function normalizePhone(value: string) {
  let phone = value.replace(/[\s()+-]/g, "");
  if (/^8\d{10}$/.test(phone)) phone = "7" + phone.slice(1);
  if (/^\d{10}$/.test(phone)) phone = "7" + phone;
  return /^7\d{10}$/.test(phone) ? phone : "";
}

export async function exchangeYandexCode(code: string, verifier: string) {
  const config = yandexConfig();
  if (!config) throw new Error("not_configured");
  // Used only by local integration tests. Production always uses Yandex.
  const testBase = process.env.NODE_ENV !== "production" ? process.env.YANDEX_AUTH_TEST_URL : undefined;
  if (testBase && !/^http:\/\/127\.0\.0\.1:\d+$/.test(testBase)) throw new Error("Invalid test endpoint");
  const tokenResponse = await fetch(testBase ? testBase + "/token" : "https://oauth.yandex.ru/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: config.clientId, client_secret: config.secret, code_verifier: verifier }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!tokenResponse.ok) throw new Error("Token exchange failed");
  const token = await tokenResponse.json();
  if (typeof token.access_token !== "string" || !token.access_token || token.error) throw new Error("Missing token");
  const userResponse = await fetch(testBase ? testBase + "/info" : "https://login.yandex.ru/info?format=json", {
    headers: { Authorization: "OAuth " + token.access_token }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!userResponse.ok) throw new Error("User info failed");
  const user = await userResponse.json();
  if (typeof user.id !== "string" || !/^\d{1,30}$/.test(user.id) || user.client_id !== config.clientId) throw new Error("Invalid identity");
  const text = (value: unknown, max: number) => typeof value === "string" ? value.replace(/[<>\x00-\x1f]/g, "").trim().slice(0, max) : "";
  const email = text(user.default_email, 150);
  return { yandexId: user.id, fullname: text(user.real_name || user.display_name || user.first_name, 100) || "Гость SHERLOCK",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "", phone: normalizePhone(text(user.default_phone?.number, 25)) };
}
