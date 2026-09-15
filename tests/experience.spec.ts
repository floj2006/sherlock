import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockBooking, fillVisit, testService, testExtraService, testMaster, chooseTestMaster, openVisitSummary, closeVisitSummary } from "./booking-fixture";

test.beforeEach(async ({ page }) => {
  await mockBooking(page);
  await page.route(/https:\/\/yandex\.ru\/(map-widget|maps-reviews-widget|sprav\/widget\/rating-badge)\//, route => route.fulfill({ contentType: "text/html", body: '<html lang="ru"><title>Карта</title><body></body></html>' }));
});
test("booking completes on the website and submits the exact selected visit", async ({ page, context }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Записаться на стрижку", exact: true }).click();
  await expect(page).toHaveURL(/\/book\?/);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Онлайн-запись" })).toHaveCount(0);
  await fillVisit(page);
  await openVisitSummary(page);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-native-booking.png`, fullPage: true });
  const request = page.waitForRequest(req => req.method() === "POST" && req.url().endsWith("/api/booking"));
  await page.getByRole("button", { name: "Подтвердить запись" }).click();
  const body = (await request).postDataJSON();
  expect(body.serviceIds).toEqual([testService.id]);
  expect(body.staffId).toBe(testMaster.id);
  expect(body.consent).toBe(true);
  await expect(page.getByRole("heading", { name: "Вы записаны." })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("7654321");
  expect(context.pages()).toHaveLength(1);
});

test("multiple services share a visit, total price and duration; changes clear the slot", async ({ page }, testInfo) => {
  await page.goto("/book"); await fillVisit(page);
  await page.locator(".service-category-toggle").filter({ hasText: "Уход" }).click();
  await page.getByRole("checkbox", { name: testExtraService.title, exact: true }).check();
  await expect(page.getByRole("combobox", { name: "Мастер", exact: true })).toContainText("Выберите мастера");
  await expect(page.getByRole("button", { name: "12:00", exact: true })).toHaveCount(0);
  await openVisitSummary(page);
  await expect(page.getByRole("button", { name: "Подтвердить запись" })).toBeDisabled();
  await expect(page.locator(".visit-price")).toHaveText(/Итого2\s300 ₽ – 2\s500 ₽/);
  await expect(page.locator(".visit-summary")).toContainText("65 мин");
  await expect(page.getByLabel("Имя", { exact: true })).toHaveValue("Тестовый гость");
  await page.getByRole("button", { name: `Убрать: ${testExtraService.title}`, exact: true }).click();
  await expect(page.getByRole("checkbox", { name: testExtraService.title, exact: true })).not.toBeChecked();
  await expect(page.locator(".visit-price")).toHaveText(/Итого1\s900 ₽/);
  await closeVisitSummary(page);
  await page.getByRole("checkbox", { name: testExtraService.title, exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".visit-services")).toContainText(testExtraService.title);
  await chooseTestMaster(page);
  await page.getByRole("group", { name: "Свободные даты", exact: true }).getByRole("button").first().click();
  await page.getByRole("button", { name: "12:00", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-multiple-services.png`, fullPage: true });
  const request = page.waitForRequest(req => req.method() === "POST" && req.url().endsWith("/api/booking"));
  await openVisitSummary(page);
  await page.getByRole("button", { name: "Подтвердить запись" }).click();
  expect((await request).postDataJSON()).toMatchObject({ serviceIds: [testService.id, testExtraService.id], priceMin: 2300, priceMax: 2500 });
  await expect(page.getByRole("status")).toContainText(testExtraService.title);
  await expect(page.getByRole("status")).toContainText(testService.title);
});

test("removing the last service disables booking and clears totals", async ({ page }) => {
  await page.goto("/book"); await fillVisit(page);
  await openVisitSummary(page);
  await page.getByRole("button", { name: `Убрать: ${testService.title}`, exact: true }).click();
  await expect(page.getByLabel("Мастер", { exact: true })).toBeDisabled();
  await expect(page.locator(".visit-price")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Подтвердить запись" })).toBeDisabled();
});
test("a stale slot keeps guest contacts and requires selecting time again", async ({ page }) => {
  await page.route("**/api/booking", async route => route.request().method() === "POST"
    ? route.fulfill({ status: 409, json: { state: "rejected", code: "SLOT_TAKEN", error: "Это время уже занято. Выберите другое свободное время." } }) : route.fallback());
  await page.goto("/book"); await fillVisit(page);
  await openVisitSummary(page);
  await page.getByRole("button", { name: "Подтвердить запись" }).click();
  await expect(page.getByText("Это время уже занято.", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Имя", { exact: true })).toHaveValue("Тестовый гость");
  await expect(page.getByRole("button", { name: "12:00", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Подтвердить запись" })).toBeDisabled();
});
test("unknown response never displays success or automatically resubmits", async ({ page }) => {
  let count = 0; const ids: string[] = [];
  await page.route("**/api/booking", async route => {
    if (route.request().method() !== "POST") return route.fallback();
    count++; ids.push(route.request().postDataJSON().requestId);
    await route.fulfill({ status: 202, json: { state: "unknown", error: "Подтверждение пока не получено." } });
  });
  await page.goto("/book"); await fillVisit(page);
  await openVisitSummary(page);
  await page.getByRole("button", { name: "Подтвердить запись" }).click();
  await expect(page.getByRole("button", { name: "Проверить подтверждение" })).toBeVisible();
  await expect(page.getByLabel("Телефон", { exact: true })).toBeDisabled();
  expect(count).toBe(1);
  await page.getByRole("button", { name: "Проверить подтверждение" }).click();
  await expect.poll(() => count).toBe(2);
  expect(ids[0]).toBe(ids[1]);
  await expect(page.getByRole("heading", { name: "Вы записаны." })).toHaveCount(0);
});
test("mobile menu restores focus and opens the native booking page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  const trigger = page.getByRole("button", { name: "Меню", exact: true }); await trigger.click();
  const menu = page.getByRole("dialog", { name: "Меню SHERLOCK" });
  await expect(menu.getByRole("button", { name: "Закрыть меню" })).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(menu.getByRole("button", { name: "Записаться", exact: true })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(trigger).toBeFocused();
  await trigger.click(); await menu.getByRole("button", { name: "Записаться", exact: true }).click();
  await expect(page).toHaveURL(/\/book\?/); await expect(menu).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
