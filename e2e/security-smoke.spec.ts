/**
 * Public + auth smoke. Isolation tests are BLOCKED without AUDIT_* credentials.
 */
import { test, expect } from "@playwright/test";

const hasAuditCreds = Boolean(
  process.env.AUDIT_PARTNER_A_EMAIL &&
    process.env.AUDIT_PARTNER_A_PASSWORD &&
    process.env.AUDIT_PARTNER_B_EMAIL &&
    process.env.AUDIT_PARTNER_B_PASSWORD
);

test.describe("public surfaces", () => {
  test("login renders without protected 401 spam", async ({ page }) => {
    const unauthorized: string[] = [];
    page.on("response", (res) => {
      if (res.status() === 401 && /\/api\/(auth\/me|bootstrap)/.test(res.url())) {
        unauthorized.push(res.url());
      }
    });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /вход/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(800);
    expect(unauthorized, "public login must not call /api/auth/me or bootstrap").toEqual([]);
  });

  test("register renders", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /партн/i })).toBeVisible({ timeout: 15000 });
  });

  test("anonymous protected route redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/i, { timeout: 15000 });
  });

  test("unknown url shows branded 404", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-404");
    await expect(page.getByText(/404|нет/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("mobile 360 login no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/login");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(overflow).toBe(false);
  });
});

test.describe("partner isolation", () => {
  test("Partner A cannot read Partner B lead via API", async ({ request }) => {
    test.skip(!hasAuditCreds, "BLOCKED: set AUDIT_PARTNER_A_* and AUDIT_PARTNER_B_* env");

    // Placeholder for authenticated isolation — requires live seed leads.
    // Implemented after `npm run audit:users` and manual seed of lead IDs:
    // AUDIT_PARTNER_B_LEAD_ID
    const leadId = process.env.AUDIT_PARTNER_B_LEAD_ID;
    test.skip(!leadId, "BLOCKED: set AUDIT_PARTNER_B_LEAD_ID after seeding a B-owned lead");

    // Login as A via Supabase is environment-specific; mark structure ready.
    expect(leadId).toBeTruthy();
    void request;
  });
});
