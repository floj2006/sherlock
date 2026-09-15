import { test, expect } from "@playwright/test";

test("portfolio uses one font and the photo viewer restores keyboard focus", async ({ page }) => {
  await page.goto("/works");
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator('.portfolio-card').first();
  const families = await page.locator('body, h1, .case-description, .case-outcome, .case-actions button, .desktop-nav a').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).fontFamily));
  expect(new Set(families).size).toBe(1);
  const photos = card.locator('.case-media-stage');
  const dimensions = await photos.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
  expect(Math.abs(dimensions[0] - dimensions[1])).toBeLessThan(1);
  await expect(page.locator('.photo-dialog')).toHaveCount(0);
  const trigger = card.getByRole('button', { name: /^Увеличить:/ }).first();
  await trigger.click();
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();
  const close = viewer.getByRole('button', { name: 'Закрыть фотографию' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  const breakdown = card.locator('details');
  await breakdown.locator('summary').click();
  await expect(breakdown).toHaveAttribute('open', '');
  await expect(breakdown.locator('li').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("reduced motion leaves case content visible without reveal animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/works');
  const card = page.locator('.portfolio-card').nth(2);
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByRole('heading')).toBeVisible();
  expect(await page.locator('.reveal-section').evaluateAll(nodes => nodes.flatMap(node => node.getAnimations()).length)).toBe(0);
});
