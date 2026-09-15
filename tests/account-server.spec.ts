import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GET as start } from "../src/app/api/auth/yandex/route";
import { GET as callback } from "../src/app/api/auth/yandex/callback/route";
import { GET as profile, PATCH } from "../src/app/api/account/route";
import { POST as logout } from "../src/app/api/auth/logout/route";
import { accountDb, closeAccountDatabases } from "../src/lib/account-db";
import { createSession, digest, findOrCreateUser, SESSION_COOKIE, storeAccountVisit, userFromToken } from "../src/lib/account-auth";
import { safeReturnPath } from "../src/lib/yandex-auth";
import { requestOrigin } from "../src/lib/request-origin";

let mock: Server, directory: string;
let exchanged: URLSearchParams, tokenCalls = 0, mode = "ok";
const original = Object.fromEntries(["YANDEX_CLIENT_ID", "YANDEX_CLIENT_SECRET", "YANDEX_REDIRECT_URI", "YANDEX_AUTH_TEST_URL", "ACCOUNT_DB_PATH"].map(key => [key, process.env[key]]));
const url = "http://localhost";
const cookieFrom = (response: Response, name: string) => response.headers.getSetCookie().find(cookie => cookie.startsWith(name + "="))?.split(";")[0] || "";
const request = (pathname: string, cookie = "") => new Request(url + pathname, { headers: { cookie } });
async function flow(next = "/account") {
  const response = await start(request("/api/auth/yandex?next=" + encodeURIComponent(next)));
  const location = new URL(response.headers.get("location")!);
  return { response, location, state: location.searchParams.get("state")!, cookie: cookieFrom(response, "sherlock_oauth") };
}
async function login() {
  const attempt = await flow();
  const response = await callback(request(`/api/auth/yandex/callback?code=test-code&state=${attempt.state}`, attempt.cookie));
  return { response, cookie: cookieFrom(response, SESSION_COOKIE) };
}

test.beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "sherlock-account-test-"));
  process.env.ACCOUNT_DB_PATH = path.join(directory, "accounts.sqlite");
  process.env.YANDEX_CLIENT_ID = "test-client";
  process.env.YANDEX_CLIENT_SECRET = "private-client-secret";
  process.env.YANDEX_REDIRECT_URI = url + "/api/auth/yandex/callback";
  mock = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/token") {
      tokenCalls++;
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      exchanged = new URLSearchParams(Buffer.concat(chunks).toString());
      res.end(JSON.stringify(mode === "token-error" ? { error: "invalid_grant" } : { access_token: "private-yandex-token", token_type: "bearer" }));
    } else {
      expect(req.headers.authorization).toBe("OAuth private-yandex-token");
      res.end(JSON.stringify({ id: "123456789", client_id: mode === "wrong-client" ? "wrong-client" : "test-client", real_name: "Тестовый Гость", default_email: "guest@example.test", default_phone: { number: "+7 (900) 111-22-33" } }));
    }
  });
  await new Promise<void>(resolve => mock.listen(0, "127.0.0.1", resolve));
  process.env.YANDEX_AUTH_TEST_URL = `http://127.0.0.1:${(mock.address() as { port: number }).port}`;
});
test.beforeEach(() => {
  mode = "ok"; tokenCalls = 0;
  accountDb().exec("DELETE FROM account_visits; DELETE FROM sessions; DELETE FROM users; DELETE FROM oauth_intents; DELETE FROM auth_limits;");
});
test.afterAll(async () => {
  await new Promise<void>(resolve => mock.close(() => resolve()));
  closeAccountDatabases();
  if (path.dirname(path.resolve(directory)) !== path.resolve(tmpdir()) || !path.basename(directory).startsWith("sherlock-account-test-")) throw new Error("Unexpected test directory");
  await rm(directory, { recursive: true, force: true });
  for (const [key, value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});

test("Yandex login uses PKCE, consumes state once and persists an opaque session", async () => {
  const attempt = await flow("/book?services=mens-cut,waxing");
  expect(attempt.location.origin).toBe("https://oauth.yandex.ru");
  expect(attempt.location.searchParams.get("code_challenge_method")).toBe("S256");
  expect(attempt.response.headers.get("set-cookie")).toContain("HttpOnly; SameSite=Lax");
  const response = await callback(request(`/api/auth/yandex/callback?code=test-code&state=${attempt.state}`, attempt.cookie));
  expect(response.headers.get("location")).toBe(url + "/book?services=mens-cut%2Cwaxing");
  expect(exchanged.get("grant_type")).toBe("authorization_code");
  expect(exchanged.get("client_secret")).toBe("private-client-secret");
  expect(Buffer.from(digest(exchanged.get("code_verifier")!), "hex").toString("base64url")).toBe(attempt.location.searchParams.get("code_challenge"));
  const cookie = cookieFrom(response, SESSION_COOKIE);
  expect(cookie).toMatch(/^sherlock_session=[A-Za-z0-9_-]{43}$/);
  expect(JSON.stringify([...response.headers])).not.toContain("private-yandex-token");
  expect((await (await profile(request("/api/account", cookie))).json()).user.phone).toBe("79001112233");
  closeAccountDatabases();
  expect((await profile(request("/api/account", cookie))).status).toBe(200);
  const replay = await callback(request(`/api/auth/yandex/callback?code=test-code&state=${attempt.state}`, attempt.cookie));
  expect(replay.headers.get("location")).toContain("error=expired");
  expect(tokenCalls).toBe(1);
  const raw = await readFile(process.env.ACCOUNT_DB_PATH!, "utf8");
  expect(raw).not.toContain(cookie.split("=")[1]);
});

test("missing binding, forged state, expired requests and cancelled logins do not authenticate", async () => {
  const attempt = await flow();
  expect((await callback(request(`/api/auth/yandex/callback?code=x&state=${attempt.state}`))).headers.get("location")).toContain("error=expired");
  expect((await callback(request("/api/auth/yandex/callback?code=x&state=forged", attempt.cookie))).headers.get("location")).toContain("error=expired");
  accountDb().prepare("UPDATE oauth_intents SET expires_at=0").run();
  expect((await callback(request(`/api/auth/yandex/callback?code=x&state=${attempt.state}`, attempt.cookie))).headers.get("location")).toContain("error=expired");
  const cancelled = await flow();
  expect((await callback(request(`/api/auth/yandex/callback?error=access_denied&state=${cancelled.state}`, cancelled.cookie))).headers.get("location")).toContain("error=cancelled");
  expect(tokenCalls).toBe(0);
});

test("provider failures and tokens for another client never create users", async () => {
  for (const failure of ["token-error", "wrong-client"]) {
    mode = failure;
    const { response, cookie } = await login();
    expect(cookie).toBe(""); expect(response.headers.get("location")).toContain("error=unavailable");
  }
  expect(accountDb().prepare("SELECT count(*) AS count FROM users").get()).toEqual({ count: 0 });
});

test("cancelled and failed logins preserve only the booking target from the verified intent", async () => {
  const next = "/book?services=mens-cut,waxing&master=4817964";
  for (const failure of ["cancelled", "token-error", "wrong-client", "missing-code"]) {
    mode = failure;
    const attempt = await flow(next);
    const params = new URLSearchParams({ state: attempt.state, next: "https://evil.example" });
    if (failure === "cancelled") params.set("error", "access_denied");
    else if (failure !== "missing-code") params.set("code", "test-code");
    const response = await callback(request("/api/auth/yandex/callback?" + params, attempt.cookie));
    const destination = new URL(response.headers.get("location")!);
    expect(destination.origin).toBe(url);
    expect(destination.pathname).toBe("/account");
    expect(destination.searchParams.get("error")).toBe(failure === "cancelled" ? "cancelled" : failure === "missing-code" ? "expired" : "unavailable");
    expect(destination.searchParams.get("next")).toBe(safeReturnPath(next));
    expect(cookieFrom(response, SESSION_COOKIE)).toBe("");
  }
  const forged = await callback(request("/api/auth/yandex/callback?state=forged&next=" + encodeURIComponent(next)));
  expect(new URL(forged.headers.get("location")!).searchParams.has("next")).toBe(false);
});

test("unconfigured login preserves a safe booking target", async () => {
  const secret = process.env.YANDEX_CLIENT_SECRET;
  try {
    delete process.env.YANDEX_CLIENT_SECRET;
    for (const next of ["/book?service=mens-cut&master=4817964", "https://evil.example"]) {
      const response = await start(request("/api/auth/yandex?next=" + encodeURIComponent(next)));
      const destination = new URL(response.headers.get("location")!);
      expect(destination.searchParams.get("error")).toBe("not_configured");
      expect(destination.searchParams.get("next")).toBe(next.startsWith("/book") ? next : null);
    }
  } finally { process.env.YANDEX_CLIENT_SECRET = secret; }
});

test("malformed profile fields never erase saved contacts", async () => {
  const { cookie } = await login();
  const before = (await (await profile(request("/api/account", cookie))).json()).user;
  const valid = { fullname: before.fullname, email: before.email, phone: before.phone };
  for (const input of [null, [], { fullname: "Новое имя" }, { ...valid, email: 123 }, { ...valid, email: null }, { ...valid, phone: false }, { ...valid, phone: " ".repeat(26) + before.phone }]) {
    const response = await PATCH(new Request(url + "/api/account", { method: "PATCH", headers: { cookie, origin: url, "Content-Type": "application/json" }, body: JSON.stringify(input) }));
    expect(response.status).toBe(400);
    expect((await (await profile(request("/api/account", cookie))).json()).user).toEqual(before);
  }
  const clear = await PATCH(new Request(url + "/api/account", { method: "PATCH", headers: { cookie, origin: url, "Content-Type": "application/json" }, body: JSON.stringify({ fullname: before.fullname, email: "", phone: "" }) }));
  expect(clear.status).toBe(200);
  expect((await clear.json()).user).toMatchObject({ email: "", phone: "" });
});

test("account identities never merge by contact data; profile and visits are owner-scoped", async () => {
  const { cookie } = await login();
  const first = (await (await profile(request("/api/account", cookie))).json()).user;
  const other = findOrCreateUser("987654321", { fullname: "Другой гость", email: first.email, phone: first.phone });
  expect(other.id).not.toBe(first.id);
  storeAccountVisit(first.id, { recordId: 555, datetime: "2026-10-01T12:00:00+03:00", services: ["Стрижка"], serviceSlugs: ["mens-cut"], master: "Мастер", priceMin: 1900, priceMax: 1900 });
  const otherCookie = SESSION_COOKIE + "=" + createSession(other.id);
  expect((await (await profile(request("/api/account", otherCookie))).json()).visits).toEqual([]);
  const update = await PATCH(new Request(url + "/api/account", { method: "PATCH", headers: { cookie, origin: url, "Content-Type": "application/json" }, body: JSON.stringify({ id: other.id, fullname: "Новое имя", email: first.email, phone: first.phone }) }));
  expect(update.status).toBe(200);
  expect((await (await profile(request("/api/account", otherCookie))).json()).user.fullname).toBe("Другой гость");
  expect((await (await profile(request("/api/account", cookie))).json()).visits[0].recordId).toBe(555);
  expect((await login()).cookie).not.toBe(cookie);
  expect(accountDb().prepare("SELECT count(*) AS count FROM users").get()).toEqual({ count: 2 });
});

test("sessions expire, logout revokes access and foreign-origin mutations are rejected", async () => {
  const { cookie } = await login();
  const evil = new Request(url + "/api/auth/logout", { method: "POST", headers: { cookie, origin: "https://evil.example" } });
  expect((await logout(evil)).status).toBe(403);
  expect((await PATCH(new Request(url + "/api/account", { method: "PATCH", headers: { cookie, origin: "https://evil.example", "Content-Type": "application/json" }, body: "{}" }))).status).toBe(403);
  expect((await logout(new Request(url + "/api/auth/logout", { method: "POST", headers: { cookie, origin: url } }))).headers.get("set-cookie")).toContain("Max-Age=0");
  expect((await profile(request("/api/account", cookie))).status).toBe(401);
  const next = await login();
  accountDb().prepare("UPDATE sessions SET expires_at=0").run();
  expect(userFromToken(next.cookie.split("=")[1])).toBeNull();
});

test("return targets stay on the site and missing configuration fails closed", async () => {
  for (const input of ["https://evil.example", "//evil.example", "/\\evil.example", "/api/auth/logout", "/account?evil=1"]) expect(safeReturnPath(input)).toBe("/account");
  delete process.env.YANDEX_CLIENT_SECRET;
  expect((await start(request("/api/auth/yandex"))).headers.get("location")).toContain("error=not_configured");
  process.env.YANDEX_CLIENT_SECRET = "private-client-secret";
  process.env.YANDEX_REDIRECT_URI = "https://sherlock.example/api/auth/yandex/callback";
  expect((await start(request("/api/auth/yandex"))).headers.get("location")).toContain("error=wrong_domain");
  process.env.YANDEX_REDIRECT_URI = url + "/api/auth/yandex/callback";
});

test("origin checks use the target host while ignoring an injected forwarded host", async () => {
  const { cookie } = await login();
  const headers = { cookie, host: "127.0.0.1:3101", origin: "http://127.0.0.1:3101", "x-forwarded-host": "evil.example", "Content-Type": "application/json" };
  const req = new Request("http://localhost:3101/api/account", { method: "PATCH", headers, body: JSON.stringify({ fullname: "Гость", email: "", phone: "" }) });
  expect(requestOrigin(req)).toBe("http://127.0.0.1:3101");
  expect((await PATCH(req)).status).toBe(200);
  const forged = new Request("http://localhost:3101/api/account", { method: "PATCH", headers: { ...headers, origin: "https://evil.example" }, body: "{}" });
  expect((await PATCH(forged)).status).toBe(403);
});
