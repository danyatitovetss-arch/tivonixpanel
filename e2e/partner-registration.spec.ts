/**
 * Minimal Playwright smoke specs for partner registration journey.
 * Run against a staging/local env with migrations applied:
 *   npx playwright test e2e/partner-registration.spec.ts
 *
 * Requires E2E_BASE_URL (default http://127.0.0.1:3000).
 * Does not hit production by default.
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

test.describe("partner registration UI", () => {
  test("register page renders and accepts type=referral", async ({ page }) => {
    await page.goto(`${BASE}/register?type=referral`);
    await expect(page.getByRole("heading", { name: /партн/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Referral/i).first()).toBeVisible();
  });

  test("register page accepts type=white_label", async ({ page }) => {
    await page.goto(`${BASE}/register?type=white_label`);
    await expect(page.getByText(/White-label/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("login page renders", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole("heading", { name: /вход/i })).toBeVisible({ timeout: 15000 });
  });

  test("anonymous cannot open admin applications", async ({ page }) => {
    const res = await page.goto(`${BASE}/admin/partner-applications`);
    // middleware redirects to login
    await expect(page).toHaveURL(/login/i, { timeout: 15000 });
    expect(res?.status() ?? 200).toBeLessThan(500);
  });

  test("mobile 375 register has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/register`);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });
});
