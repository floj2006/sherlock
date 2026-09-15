import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GET, POST } from "../src/app/api/booking/route";
import { accountVisits, createSession, findOrCreateUser, SESSION_COOKIE } from "../src/lib/account-auth";
import { closeAccountDatabases } from "../src/lib/account-db";

let mock: Server;
let directory: string;
let records = 0;
let mode = "success";
let received: Record<string, unknown>;
let auth = "";
let queries: { path: string; ids: string[] }[] = [];
let checked: Record<string, unknown>;
const original = { company: process.env.YCLIENTS_COMPANY_ID, partner: process.env.YCLIENTS_PARTNER_TOKEN, base: process.env.YCLIENTS_BOOKING_TEST_URL, state: process.env.BOOKING_STATE_DIR, accounts: process.env.ACCOUNT_DB_PATH };
const day = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
const datetime = day + "T12:00:00+03:00";
const service = { id: 28026618, title: "Стрижка", price_min: 1900, price_max: 1900, seance_length: 3000, active: 1, prepaid: "forbidden" };
const extraService = { ...service, id: 15291942, title: "Воск", price_min: 400, price_max: 600, seance_length: 900 };
const staff = [{ id: 4817964, name: "Эрдни", specialization: "Барбер" }, { id: 5954412, name: "Ксения", specialization: "Администратор" }];

test.beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "sherlock-booking-test-"));
  mock = createServer(async (req, res) => {
    auth = String(req.headers.authorization);
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    const url = new URL(req.url!, "http://localhost");
    const pathname = url.pathname;
    queries.push({ path: pathname, ids: url.searchParams.getAll("service_ids[]") });
    let data: unknown;
    let status = 200;
    if (pathname.includes("book_services")) data = { services: mode === "missing-service" ? [service] : [service, extraService] };
    else if (pathname.includes("book_staff")) data = staff;
    else if (pathname.includes("book_dates")) data = { booking_dates: [day] };
    else if (pathname.includes("book_times")) data = [{ time: "12:00", datetime, seance_length: url.searchParams.getAll("service_ids[]").length > 1 ? 3900 : 3000 }];
    else if (pathname.includes("book_check")) {
      checked = body;
      if (mode === "conflict") { res.writeHead(422, { "Content-Type": "application/json" }); res.end(JSON.stringify({ success: false, meta: { errors: [{ code: 433 }] } })); return; }
      status = 201;
    } else if (pathname.includes("book_record")) {
      records++; received = body;
      await new Promise(resolve => setTimeout(resolve, 40));
      if (mode === "uncertain") { res.writeHead(500); res.end("failure"); return; }
      status = 201; data = [{ id: 1, record_id: 7654321, record_hash: "must-stay-private" }];
    } else { res.writeHead(404); res.end(); return; }
    res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify({ success: true, data }));
  });
  await new Promise<void>(resolve => mock.listen(0, "127.0.0.1", resolve));
  const address = mock.address() as { port: number };
  process.env.YCLIENTS_BOOKING_TEST_URL = `http://127.0.0.1:${address.port}/api/v1`;
  process.env.YCLIENTS_COMPANY_ID = "1024543";
  process.env.YCLIENTS_PARTNER_TOKEN = "mock-partner";
  process.env.BOOKING_STATE_DIR = directory;
  process.env.ACCOUNT_DB_PATH = path.join(directory, "accounts.sqlite");
});
test.afterAll(async () => {
  await new Promise<void>(resolve => mock.close(() => resolve()));
  closeAccountDatabases();
  if (path.dirname(path.resolve(directory)) !== path.resolve(tmpdir()) || !path.basename(directory).startsWith("sherlock-booking-test-")) throw new Error("Unexpected temporary directory");
  await rm(directory, { recursive: true, force: true });
  for (const [key, value] of Object.entries({ YCLIENTS_COMPANY_ID: original.company, YCLIENTS_PARTNER_TOKEN: original.partner, YCLIENTS_BOOKING_TEST_URL: original.base, BOOKING_STATE_DIR: original.state, ACCOUNT_DB_PATH: original.accounts })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
test.beforeEach(() => { records = 0; mode = "success"; queries = []; });
const payload = (phone: string) => ({ requestId: crypto.randomUUID(), serviceId: 28026618, staffId: 4817964, datetime, fullname: "Тестовый гость", phone, email: "guest@example.test", comment: "", consent: true, priceMin: 1900, priceMax: 1900 });
const post = (body: unknown, origin = "http://localhost", cookie = "") => POST(new Request("http://localhost/api/booking", { method: "POST", headers: { origin, cookie, "Content-Type": "application/json", "x-forwarded-for": test.info().title }, body: JSON.stringify(body) }));

test("public booking options exclude administrators", async () => {
  const response = await GET(new Request("http://localhost/api/booking?serviceId=28026618"));
  expect((await response.json()).masters.map((item: { name: string }) => item.name)).toEqual(["Эрдни"]);
  expect(auth).toBe("Bearer mock-partner");
});
test("creates one record and returns the same receipt after a duplicate or restart", async () => {
  const input = payload("+7 (900) 000-00-01");
  const [a, b] = await Promise.all([post(input), post({ ...input, requestId: crypto.randomUUID() })]);
  expect([a.status, b.status].sort()).toEqual([201, 202]);
  const replay = await post(input);
  expect(await replay.json()).toEqual({ state: "confirmed", recordId: 7654321 });
  expect(records).toBe(1);
  expect(received.phone).toBe("79000000001");
  expect(received.appointments).toEqual([{ id: 1, services: [28026618], staff_id: 4817964, datetime }]);
  expect(received.is_personal_data_processing_allowed).toBe(true);
  expect(received.is_newsletter_allowed).toBe(false);
});
test("stale slots and changed prices never create a record", async () => {
  mode = "conflict";
  const conflict = await post(payload("79000000002"));
  expect(conflict.status).toBe(409);
  expect((await conflict.json()).code).toBe("SLOT_TAKEN");
  mode = "success";
  const changed = await post({ ...payload("79000000003"), priceMin: 1600 });
  expect((await changed.json()).code).toBe("PRICE_CHANGED");
  expect(records).toBe(0);
});
test("uncertain upstream response blocks resending the appointment", async () => {
  mode = "uncertain";
  const input = payload("79000000004");
  const first = await post(input);
  expect((await first.json()).state).toBe("unknown");
  const second = await post(input);
  expect((await second.json()).state).toBe("unknown");
  expect(records).toBe(1);
});
test("invalid contacts, missing consent, foreign origins and excluded staff are rejected", async () => {
  expect((await post({ ...payload("invalid"), consent: false })).status).toBe(400);
  expect((await post(payload("79000000005"), "https://other.example")).status).toBe(403);
  expect((await post({ ...payload("79000000005"), staffId: 5954412 })).status).toBe(422);
  expect(records).toBe(0);
});

test("multiple services reach every YCLIENTS endpoint and create one appointment", async () => {
  const ids = [service.id, extraService.id];
  const options = await GET(new Request(`http://localhost/api/booking?serviceIds=${ids.join(",")}&staffId=4817964`));
  expect(options.status).toBe(200);
  expect((await options.json()).totals).toEqual({ priceMin: 2300, priceMax: 2500, duration: 3900 });
  const times = await GET(new Request(`http://localhost/api/booking?serviceIds=${ids.join(",")}&staffId=4817964&date=${day}`));
  expect((await times.json()).slots[0].duration).toBe(3900);
  const input = { ...payload("79000000006"), serviceIds: ids, priceMin: 2300, priceMax: 2500 };
  expect((await post(input)).status).toBe(201);
  const expectedAppointment = [{ id: 1, services: [...ids].sort((a, b) => a - b), staff_id: 4817964, datetime }];
  expect(checked.appointments).toEqual(expectedAppointment);
  expect(received.appointments).toEqual(expectedAppointment);
  for (const endpoint of ["book_staff", "book_dates", "book_times"]) {
    const calls = queries.filter(query => query.path.includes(endpoint));
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call.ids.sort()).toEqual(ids.map(String).sort());
  }
  const replay = await post({ ...input, requestId: crypto.randomUUID(), serviceIds: [...ids].reverse() });
  expect(await replay.json()).toEqual({ state: "confirmed", recordId: 7654321 });
  expect(records).toBe(1);
});

test("unavailable combinations and changed combined prices never create an appointment", async () => {
  const input = { ...payload("79000000007"), serviceIds: [service.id, extraService.id], priceMin: 2300, priceMax: 2500 };
  mode = "missing-service";
  expect((await (await post(input)).json()).code).toBe("SELECTION_INVALID");
  mode = "success";
  expect((await (await post({ ...input, priceMax: 2300 })).json()).code).toBe("PRICE_CHANGED");
  expect(records).toBe(0);
});

test("empty, duplicate, unknown and malformed service sets are rejected", async () => {
  for (const serviceIds of [[], [service.id, service.id], [service.id, 1], ["28026618"], [0], [null]]) {
    expect((await post({ ...payload("79000000008"), serviceIds })).status).toBe(400);
  }
  for (const query of ["serviceIds=", "serviceIds=28026618,28026618", "serviceIds=1", "serviceIds=NaN", "serviceIds=28026618&serviceId=28026618"]) {
    expect((await GET(new Request("http://localhost/api/booking?" + query))).status).toBe(400);
  }
  expect(records).toBe(0);
});

test("a confirmed visit belongs to the account that created it, including after a replay", async () => {
  const owner = findOrCreateUser("111", { fullname: "Гость", phone: "79000000009", email: "guest@example.test" });
  const another = findOrCreateUser("222", { fullname: "Другой", phone: owner.phone, email: owner.email });
  const input = { ...payload(owner.phone), serviceIds: [service.id, extraService.id], priceMin: 2300, priceMax: 2500 };
  const cookie = SESSION_COOKIE + "=" + createSession(owner.id);
  const response = await post(input, "http://localhost", cookie);
  expect(await response.json()).toEqual({ state: "confirmed", recordId: 7654321 });
  expect(accountVisits(owner.id)[0]).toMatchObject({ recordId: 7654321, priceMin: 2300, priceMax: 2500 });
  expect(accountVisits(owner.id)[0].services).toHaveLength(2);
  await post(input, "http://localhost", SESSION_COOKIE + "=" + createSession(another.id));
  expect(accountVisits(another.id)).toEqual([]);
  expect(accountVisits(owner.id)).toHaveLength(1);
  expect(records).toBe(1);
});
