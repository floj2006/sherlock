import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { accountDb, closeAccountDatabases } from "../src/lib/account-db";
import { createSession, findOrCreateUser, SESSION_COOKIE, storeAccountVisit } from "../src/lib/account-auth";
import { mockBooking, testService, testExtraService, testMaster, chooseTestMaster } from "./booking-fixture";

test.beforeEach(async ({ page }) => {
  if (!process.env.SHERLOCK_ACCOUNT_TEST_DB || process.env.ACCOUNT_DB_PATH !== process.env.SHERLOCK_ACCOUNT_TEST_DB) throw new Error("Use playwright.accounts.config.ts for account UI tests");
  accountDb().exec("DELETE FROM account_visits; DELETE FROM sessions; DELETE FROM users;");
  await mockBooking(page);
  await page.route(/https:\/\/yandex\.ru\/(map-widget|maps-reviews-widget)\//, route => route.fulfill({ contentType: "text/html", body: "<html lang='ru'><title>Яндекс</title><body></body></html>" }));
});
test.afterAll(() => closeAccountDatabases());

test("account entry explains Yandex login and keeps guest booking available", async ({ page }, testInfo) => {
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Войдите через Яндекс." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти с Яндекс ID" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Записаться без аккаунта ↗" })).toHaveAttribute("href", "/book");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  if (testInfo.project.name === "desktop") {
    const book = await page.locator(".header-book").boundingBox();
    const account = await page.getByRole("link", { name: "Личный кабинет", exact: true }).boundingBox();
    expect(account!.x).toBeGreaterThan(book!.x + book!.width);
  }
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-account-entry.png`, fullPage: true });
});

test("signed-in guests edit their profile, prefill booking, see their own history and logout", async ({ page, context }, testInfo) => {
  const user = findOrCreateUser("1001", { fullname: "Александр Тестовый", email: "guest@example.test", phone: "79001112233" });
  const other = findOrCreateUser("1002", { fullname: "Другой гость", email: "other@example.test", phone: "79002223344" });
  const visit = { recordId: 778899, datetime: "2026-10-01T12:00:00+03:00", services: ["Мужская стрижка", "Уход за бородой"], serviceSlugs: ["mens-cut", "beard-modeling"], master: "Эрдни", priceMin: 2900, priceMax: 2900 };
  storeAccountVisit(user.id, visit);
  storeAccountVisit(other.id, { ...visit, recordId: 998877, services: ["Чужая запись"] });
  await context.addCookies([{ name: SESSION_COOKIE, value: createSession(user.id), domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/account");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Александр");
  await expect(page.getByText("Запись № 778899", { exact: true })).toBeVisible();
  await expect(page.getByText("Чужая запись")).toHaveCount(0);
  await page.getByLabel("Имя", { exact: true }).fill("  Алексей Тестовый  ");
  await page.getByLabel("Телефон", { exact: true }).fill("8 (900) 111-22-33");
  await page.getByRole("button", { name: "Сохранить данные" }).click();
  await expect(page.getByRole("status")).toHaveText("Данные сохранены.");
  await expect(page.getByLabel("Имя", { exact: true })).toHaveValue("Алексей Тестовый");
  await expect(page.getByLabel("Телефон", { exact: true })).toHaveValue("79001112233");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Алексей");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-account-profile.png`, fullPage: true });
  await page.getByRole("link", { name: "Повторить выбор услуг ↗" }).click();
  await expect(page).toHaveURL(/services=mens-cut%2Cbeard-modeling/);
  await expect(page.getByLabel("Имя", { exact: true })).toHaveValue("Алексей Тестовый");
  await expect(page.getByLabel("Телефон", { exact: true })).toHaveValue("79001112233");
  await page.goto("/account");
  await page.getByRole("button", { name: "Выйти", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Войдите через Яндекс." })).toBeVisible();
  expect((await page.request.get("/api/account")).status()).toBe(401);
});

test("guest booking keeps selected services and master through the account page", async ({ page }) => {
  await page.goto("/book");
  await page.getByRole("checkbox", { name: testService.title, exact: true }).check();
  await page.locator(".service-category-toggle").filter({ hasText: "Уход" }).click();
  await page.getByRole("checkbox", { name: testExtraService.title, exact: true }).check();
  await chooseTestMaster(page);
  const next = "/book?services=first-mens-cut%2Cwaxing&master=" + testMaster.id;
  const accountLink = page.getByRole("link", { name: "Войти и подставить контакты ↗" });
  await expect(accountLink).toHaveAttribute("href", "/account?next=" + encodeURIComponent(next));
  await accountLink.click();
  await expect(page).toHaveURL(url => url.pathname === "/account" && url.searchParams.get("next") === next);
  const guestLink = page.getByRole("link", { name: "Записаться без аккаунта ↗" });
  await expect(guestLink).toHaveAttribute("href", next);
  await guestLink.click();
  await expect(page).toHaveURL(next);
  await expect(page.locator(".visit-services")).toContainText(testService.title);
  await expect(page.locator(".visit-services")).toContainText(testExtraService.title);
  await expect(page.getByRole("combobox", { name: "Мастер", exact: true })).toContainText(testMaster.name);
});

test("menu closes accessibly with and without motion and navigates to the account", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Меню", exact: true });
  const dialog = page.getByRole("dialog", { name: "Меню SHERLOCK" });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Закрыть меню" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await dialog.getByRole("link", { name: "Личный кабинет" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
