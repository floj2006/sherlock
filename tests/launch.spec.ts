import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { mockBooking, testService, testExtraService } from "./booking-fixture";

test.beforeEach(async ({ page }) => {
  await mockBooking(page);
  // Calendar contract is tested locally; no appointments or third-party analytics are sent.
  await page.route("https://**.yclients.com/**", (route) => route.fulfill({
    contentType: "text/html", body: '<html lang="ru"><title>Тестовый календарь</title><body>Календарь: локальная проверка</body></html>',
  }));
  await page.route(/https:\/\/yandex\.ru\/(map-widget|maps-reviews-widget|sprav\/widget\/rating-badge)\//, (route) => route.fulfill({ contentType: "text/html", body: '<html lang="ru"><title>Карта</title><body></body></html>' }));
});

test("home remains readable and fits the viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Форма, которая");
  await expect(page.getByRole("link", { name: "Все отзывы на Яндексе ↗" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/" + testInfo.project.name + "-home.png" });
});

test("booking preserves a service deep link without an external calendar", async ({ page }) => {
  await page.goto("/book?service=first-mens-cut&master=4817964");
  await expect(page.locator(".visit-services")).toContainText(testService.title);
  await expect(page.getByRole("combobox", { name: "Мастер", exact: true })).toContainText("Эрдни");
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("booking preserves all services in comma-separated and repeated deep links", async ({ page }) => {
  for (const query of ["services=first-mens-cut,waxing", "service=first-mens-cut&service=waxing"]) {
    await page.goto("/book?" + query);
    await expect(page.locator(".visit-services")).toContainText(testService.title);
    await expect(page.locator(".visit-services")).toContainText(testExtraService.title);
  }
});

test("barbershop rating is rendered as a readable number with its source", async ({ page }) => {
  await page.goto("/#reviews");
  const rating = page.locator("#reviews .business-rating");
  await expect(rating).toBeVisible();
  await expect(rating.locator("strong")).toHaveText(/^[1-5],[0-9]$/);
  await expect(rating).toHaveAttribute("href", "https://yandex.ru/maps/org/137556956568/reviews/");
  await expect(page.getByRole("link", { name: "Все отзывы на Яндексе ↗" })).toBeVisible();
});

test("pages have their own canonical and confirmation is not indexed", async ({ request }) => {
  for (const route of ["/privacy", "/terms", "/thanks"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('rel="canonical" href="https://sherlock-murino.ru' + route + '"');
    if (route === "/thanks") expect(html).toContain('content="noindex, follow"');
  }
});

test("review API rejects unbounded and invalid input", async ({ request }) => {
  for (const query of ["limit=100000", "limit=-1", "limit=NaN", "limit=1.5", "staffId=0", "limit=2&limit=3"]) {
    const response = await request.get("/api/reviews?" + query);
    expect(response.status()).toBe(400);
  }
  const response = await request.get("/api/reviews?limit=3");
  expect(response.status()).toBe(200);
  expect((await response.json()).reviews.length).toBeLessThanOrEqual(3);
});

test("main page and native booking pass automated accessibility checks", async ({ page }) => {
  await page.goto("/");
  const first = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(first.violations).toEqual([]);
  await page.getByRole("button", { name: "Записаться на стрижку", exact: true }).click();
  const dialog = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(dialog.violations).toEqual([]);
});

test("content stays visible when JavaScript is unavailable", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  // This separate context does not inherit the page fixture's widget routes.
  await context.route(/https:\/\/yandex\.ru\/(map-widget|maps-reviews-widget|sprav\/widget\/rating-badge)\//, route => route.fulfill({ contentType: "text/html", body: '<html lang="ru"><title>Карта</title><body></body></html>' }));
  const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Эрдни", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Открыть календарь записи", exact: true })).toBeVisible();
  await context.close();
});
