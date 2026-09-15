import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockBooking, testService, testExtraService, testMaster, openVisitSummary, closeVisitSummary } from "./booking-fixture";

test.beforeEach(async ({ page }) => { await mockBooking(page); });

test("services move into the summary and return to their category when removed", async ({ page }, testInfo) => {
  await page.goto("/book");
  const service = page.getByRole("checkbox", { name: testService.title, exact: true });
  await service.check();
  await expect(service).toHaveCount(0);
  await expect(page.locator(".service-flight")).toHaveCount(0);
  if (testInfo.project.name === "mobile") {
    const panel = page.locator(".mobile-visit-toggle");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("1 900 ₽");
    const bounds = await panel.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    await page.screenshot({ path: `artifacts/${testInfo.project.name}-booking-bottom-panel.png` });
  }
  await openVisitSummary(page);
  await expect(page.locator(".visit-services")).toContainText(testService.title);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-booking-summary.png` });
  await page.getByRole("button", { name: `Убрать: ${testService.title}`, exact: true }).click();
  await closeVisitSummary(page);
  await expect(service).toBeVisible();
  await expect(service).not.toBeChecked();
  await expect(page.locator(".visit-services")).toHaveCount(0);
});

test("custom master picker supports keyboard selection, dismissal and accessible names", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/book");
  await page.getByRole("checkbox", { name: testService.title, exact: true }).check();
  const picker = page.getByRole("combobox", { name: "Мастер", exact: true });
  await expect(picker).toBeEnabled();
  await picker.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option", { name: new RegExp(testMaster.name) })).toBeVisible();
  await expect(page.locator(".service-flight")).toHaveCount(0);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-master-picker.png` });
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Enter");
  await expect(picker).toContainText(testMaster.name);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Свободные даты", exact: true }).getByRole("button").first()).toBeVisible();
  await picker.click();
  await page.keyboard.press("Escape");
  await expect(picker).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("categories expand and collapse, including with reduced motion", async ({ page }) => {
  await page.goto("/book");
  const category = page.locator(".service-category-toggle").filter({ hasText: "Уход" });
  const extra = page.getByRole("checkbox", { name: testExtraService.title, exact: true });
  await expect(extra).toHaveCount(0);
  await category.click();
  await expect(category).toHaveAttribute("aria-expanded", "true");
  await expect(extra).toBeVisible();
  await category.click();
  await expect(extra).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await category.click();
  await extra.check();
  await expect(page.locator(".service-flight")).toHaveCount(0);
  await expect(page.locator(".visit-services")).toContainText(testExtraService.title);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("hero keeps one wordmark and smoke respects reduced motion", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".hero-brand")).toHaveCount(0);
  await expect(page.locator(".hero-portrait")).toBeVisible();
  await expect(page.locator(".pipe-smoke")).toBeVisible();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-hero-smoke.png` });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".smoke-wisp").first()).toHaveCSS("animation-name", "none");
});

test("mobile booking button appears after the hero and hides on return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".sticky-bookbar")).toBeHidden();
  await page.locator("#services").scrollIntoViewIfNeeded();
  await expect(page.locator(".sticky-bookbar")).toBeVisible();
  await page.locator(".hero-title").scrollIntoViewIfNeeded();
  await expect(page.locator(".sticky-bookbar")).toBeHidden();
});
