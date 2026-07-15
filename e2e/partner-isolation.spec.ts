/**
 * Partner A/B isolation — Playwright (UI + API with session cookies).
 * Requires audit seed + AUDIT_* env in .env.local
 */
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const hasAudit = Boolean(
  process.env.AUDIT_PARTNER_A_EMAIL &&
    process.env.AUDIT_PARTNER_A_PASSWORD &&
    process.env.AUDIT_PARTNER_B_EMAIL &&
    process.env.AUDIT_PARTNER_B_PASSWORD
);

type ManifestIds = {
  leadA1Id: string;
  leadB1Id: string;
  partnerAProfileId: string;
  partnerBProfileId: string;
};

function loadIds(): ManifestIds | null {
  const p = path.join(process.cwd(), "audit-panel", "logs", "audit-seed-manifest.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")).ids as ManifestIds;
}

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /войти|вход/i }).click();
  await page.waitForURL(/dashboard|leads|onboarding|my/, { timeout: 30000 });
}

test.describe("partner isolation (audit data)", () => {
  test.beforeEach(() => {
    test.skip(!hasAudit, "AUDIT_* credentials required");
    test.skip(!loadIds(), "audit-seed manifest missing");
  });

  test("Partner A UI/API cannot access Partner B lead", async ({ page }) => {
    const ids = loadIds()!;
    await login(page, process.env.AUDIT_PARTNER_A_EMAIL!, process.env.AUDIT_PARTNER_A_PASSWORD!);

    const api = await page.request.get(`/api/leads/${ids.leadB1Id}`);
    expect([403, 404]).toContain(api.status());

    await page.goto(`/leads/${ids.leadB1Id}`);
    await expect(page.getByText(/404|нет|недоступ|ошиб/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("Partner B cannot PATCH Partner A lead", async ({ page }) => {
    const ids = loadIds()!;
    await login(page, process.env.AUDIT_PARTNER_B_EMAIL!, process.env.AUDIT_PARTNER_B_PASSWORD!);

    const patch = await page.request.patch(`/api/leads/${ids.leadA1Id}`, {
      data: { notes: "audit_cross_patch" },
    });
    expect([403, 404]).toContain(patch.status());
  });

  test("Partner A list leads excludes Partner B records", async ({ page }) => {
    const ids = loadIds()!;
    await login(page, process.env.AUDIT_PARTNER_A_EMAIL!, process.env.AUDIT_PARTNER_A_PASSWORD!);
    const res = await page.request.get("/api/leads");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const list = body.leads ?? body.data ?? body;
    const allIds = Array.isArray(list) ? list.map((l: { id: string }) => l.id) : [];
    expect(allIds).not.toContain(ids.leadB1Id);
    expect(allIds).toContain(ids.leadA1Id);
  });

  test("Partner A admin route blocked", async ({ page }) => {
    await login(page, process.env.AUDIT_PARTNER_A_EMAIL!, process.env.AUDIT_PARTNER_A_PASSWORD!);
    const res = await page.request.get("/api/admin/users");
    expect(res.status()).toBe(403);
  });

  test("Admin can read Partner B lead and mark-paid idempotent (audit deal)", async ({ page }) => {
    const ids = loadIds()!;
    const adminEmail = process.env.AUDIT_ADMIN_EMAIL;
    const adminPass = process.env.AUDIT_ADMIN_PASSWORD;
    test.skip(!adminEmail || !adminPass, "AUDIT_ADMIN_* required");

    await login(page, adminEmail!, adminPass!);
    const lead = await page.request.get(`/api/leads/${ids.leadB1Id}`);
    expect(lead.status()).toBe(200);

    const deals = await page.request.get("/api/deals");
    expect(deals.ok()).toBeTruthy();
    const body = await deals.json();
    const list = body.data ?? body.deals ?? body;
    const auditDeal = Array.isArray(list)
      ? list.find((d: { client_name?: string }) => d.client_name === "audit_client_a1")
      : null;
    test.skip(!auditDeal?.id, "audit deal missing");

    const mp1 = await page.request.post(`/api/deals/${auditDeal.id}/mark-paid`);
    expect([200, 409]).toContain(mp1.status());
    const mp2 = await page.request.post(`/api/deals/${auditDeal.id}/mark-paid`);
    expect([200, 409]).toContain(mp2.status());
  });

  test("logout invalidates session", async ({ page }) => {
    await login(page, process.env.AUDIT_PARTNER_A_EMAIL!, process.env.AUDIT_PARTNER_A_PASSWORD!);
    await page.goto("/dashboard");
    const logout = page.getByRole("button", { name: /выйти|logout/i });
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
    } else {
      await page.request.post("/api/auth/logout");
    }
    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(401);
  });
});
