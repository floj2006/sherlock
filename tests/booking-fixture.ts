import type { Page } from "@playwright/test";
export const testDay = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
export const testService = { id: 28026618, slug: "first-mens-cut", title: "Мужская стрижка (первый визит)", category: "Первый визит", priceMin: 1900, priceMax: 1900, duration: 3000 };
export const testExtraService = { id: 15291942, slug: "waxing", title: "Удаление волос воском", category: "Уход", priceMin: 400, priceMax: 600, duration: 900 };
export const testMaster = { id: 4817964, name: "Эрдни", role: "Топ-Барбер", image: "/masters/erdni.jpg" };
export async function chooseTestMaster(page: Page) {
  await page.getByRole("combobox", { name: "Мастер", exact: true }).click();
  await page.getByRole("option", { name: new RegExp(testMaster.name) }).click();
}
export async function openVisitSummary(page: Page) {
  const toggle = page.locator(".mobile-visit-toggle");
  if (await toggle.isVisible() && await toggle.getAttribute("aria-expanded") === "false") await toggle.click();
  // Measure contrast and capture the settled panel, after its entrance fade.
  await page.locator(".visit-summary").evaluate(async element => {
    await Promise.all(element.getAnimations({ subtree: true })
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => {})));
  });
}
export async function closeVisitSummary(page: Page) {
  const toggle = page.locator(".mobile-visit-toggle");
  if (await toggle.isVisible() && await toggle.getAttribute("aria-expanded") === "true") await toggle.click();
}
export async function mockBooking(page: Page) {
  await page.route("**/api/booking*", async route => {
    if (route.request().method() === "POST") { await route.fulfill({ status: 201, json: { state: "confirmed", recordId: 7654321 } }); return; }
    const url = new URL(route.request().url());
    const selected = [testService, testExtraService].filter(service => (url.searchParams.get("serviceIds") ?? "").split(",").includes(String(service.id)));
    if (url.searchParams.has("date")) await route.fulfill({ json: { services: selected, master: testMaster, slots: [{ time: "12:00", datetime: testDay + "T12:00:00+03:00", duration: selected.reduce((sum, service) => sum + service.duration, 0) }] } });
    else if (url.searchParams.has("staffId")) await route.fulfill({ json: { services: selected, master: testMaster, dates: [testDay] } });
    else if (url.searchParams.has("serviceIds")) await route.fulfill({ json: { masters: [testMaster] } });
    else await route.fulfill({ json: { services: [testService, testExtraService] } });
  });
}
export async function fillVisit(page: Page) {
  await page.getByRole("checkbox", { name: testService.title, exact: true }).check();
  await chooseTestMaster(page);
  await page.getByRole("group", { name: "Свободные даты", exact: true }).getByRole("button").first().click();
  await page.getByRole("button", { name: "12:00", exact: true }).click();
  await page.getByLabel("Имя", { exact: true }).fill("Тестовый гость");
  await page.getByLabel("Телефон", { exact: true }).fill("+7 (900) 000-00-01");
  await page.getByLabel("Электронная почта").fill("guest@example.test");
  await page.getByRole("checkbox", { name: "Согласен на обработку" }).check();
}
