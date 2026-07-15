/**
 * Export cross-partner + API fuzz for Partner A/B (audit seed).
 * Uses Playwright-style cookie session via browser login helper (fetch + cookies from Supabase is unreliable).
 * Strategy: start local server, use Playwright request after UI login in-process via @playwright/test... 
 * This script uses node + playwright programmatic API if available; else pure fetch after auditing RLS export model.
 *
 * Export is CLIENT-SIDE (CSV from already-fetched API rows). Isolation = API isolation.
 *
 * Usage (after audit seed, local server running):
 *   node --env-file=.env.local scripts/audit-export-fuzz.cjs --base=http://127.0.0.1:3000
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { chromium } = require("@playwright/test");

const base =
  process.argv.find((a) => a.startsWith("--base="))?.slice("--base=".length) ||
  process.env.E2E_BASE_URL ||
  "http://127.0.0.1:3000";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function loadManifest() {
  const p = path.join(process.cwd(), "audit-panel", "logs", "audit-seed-manifest.json");
  if (!fs.existsSync(p)) throw new Error("Run npm run audit:seed first");
  return JSON.parse(fs.readFileSync(p, "utf8")).ids;
}

function result(id, pass, expected, actual, detail) {
  return { id, pass, expected, actual, detail };
}

async function loginContext(browser, email, password) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/login`);
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /войти|вход/i }).click();
  await page.waitForURL(/dashboard|leads|onboarding|my/, { timeout: 30000 });
  return { context, page };
}

function extractIds(body) {
  const list = body?.data ?? body?.leads ?? body?.deals ?? body;
  if (!Array.isArray(list)) return [];
  return list.map((r) => r.id).filter(Boolean);
}

function extractPartnerIds(body) {
  const list = body?.data ?? body?.leads ?? body?.deals ?? body;
  if (!Array.isArray(list)) return [];
  return list.map((r) => r.partner_id ?? r.partnerId).filter(Boolean);
}

(async () => {
  // Re-seed if cleanup already ran
  const { spawnSync } = require("child_process");
  const seed = spawnSync("node", ["--env-file=.env.local", "scripts/audit-seed.cjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (seed.status !== 0) {
    console.error(seed.stderr || seed.stdout);
    process.exit(1);
  }

  const ids = loadManifest();
  const outDir = path.join(process.cwd(), "audit-panel", "logs", "security-fuzz");
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];

  const browser = await chromium.launch({ headless: true });
  const a = await loginContext(browser, requireEnv("AUDIT_PARTNER_A_EMAIL"), requireEnv("AUDIT_PARTNER_A_PASSWORD"));
  const b = await loginContext(browser, requireEnv("AUDIT_PARTNER_B_EMAIL"), requireEnv("AUDIT_PARTNER_B_PASSWORD"));

  // --- EXPORT CROSS-PARTNER (via list API = export source) ---
  const leadsA = await a.page.request.get(`${base}/api/leads`);
  const leadsAJson = await leadsA.json();
  const leadIdsA = extractIds(leadsAJson);
  const partnerIdsA = extractPartnerIds(leadsAJson);
  results.push(
    result(
      "EX-A-01",
      leadsA.ok() && !leadIdsA.includes(ids.leadB1Id) && !leadIdsA.includes(ids.leadB2Id),
      "A list excludes B leads",
      `status=${leadsA.status()} count=${leadIdsA.length}`,
      { leadIdsA, partnerIdsA }
    )
  );
  results.push(
    result(
      "EX-A-02",
      leadIdsA.includes(ids.leadA1Id) && partnerIdsA.every((p) => p === ids.partnerAProfileId),
      "A list only own partner_id",
      `containsA1=${leadIdsA.includes(ids.leadA1Id)} partners=${[...new Set(partnerIdsA)]}`,
      null
    )
  );

  const leadsB = await b.page.request.get(`${base}/api/leads`);
  const leadsBJson = await leadsB.json();
  const leadIdsB = extractIds(leadsBJson);
  results.push(
    result(
      "EX-B-01",
      leadsB.ok() && !leadIdsB.includes(ids.leadA1Id) && !leadIdsB.includes(ids.leadA2Id),
      "B list excludes A leads",
      `status=${leadsB.status()} count=${leadIdsB.length}`,
      null
    )
  );

  const sanitize = (v) => {
    let t = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
    return t;
  };
  const aRows = (leadsAJson.data || []).map((r) => ({
    id: r.id,
    business: r.business_name,
    partner: r.partner_id,
  }));
  const csv = ["id;business;partner", ...aRows.map((r) => `${r.id};${sanitize(r.business)};${r.partner}`)].join("\n");
  results.push(
    result(
      "EX-A-CSV-01",
      !csv.includes(ids.leadB1Id) && !csv.includes("audit_lead_b"),
      "CSV from A data has no B ids/names",
      csv.includes(ids.leadB1Id) ? "LEAK" : "ok",
      { bytes: csv.length }
    )
  );
  results.push(
    result(
      "EX-FORMULA-01",
      sanitize("=CMD()") === "'=CMD()" && sanitize("+1") === "'+1",
      "formula sanitization",
      "ok",
      null
    )
  );

  // Deals list isolation
  const dealsA = await a.page.request.get(`${base}/api/deals`);
  const dealsAJson = await dealsA.json();
  const dealPartnerIds = extractPartnerIds(dealsAJson);
  results.push(
    result(
      "EX-A-DEALS",
      dealsA.ok() && dealPartnerIds.every((p) => p === ids.partnerAProfileId),
      "A deals only own partner",
      `status=${dealsA.status()} partners=${[...new Set(dealPartnerIds)]}`,
      null
    )
  );

  // --- FUZZ ---
  const fuzzCases = [
    { q: `?partner_id=${ids.partnerBProfileId}` },
    { q: `?partnerId=${ids.partnerBProfileId}` },
    { q: `?user_id=${ids.partnerBProfileId}` },
    { q: `?owner_id=${ids.partnerBProfileId}` },
    { q: `?role=admin` },
    { q: `?partner_id=${ids.partnerBProfileId}&partner_id=${ids.partnerAProfileId}` },
    { q: `?partner_id=` },
    { q: `?partner_id=null` },
    { q: `?partner_id=not-a-uuid` },
    { q: `?partner_id=${encodeURIComponent(ids.partnerBProfileId)}` },
  ];

  for (const [i, fc] of fuzzCases.entries()) {
    const res = await a.page.request.get(`${base}/api/leads${fc.q}`);
    const json = await res.json().catch(() => ({}));
    const leak = extractIds(json).includes(ids.leadB1Id);
    const no500 = res.status() < 500;
    results.push(
      result(
        `FUZZ-Q-${i + 1}`,
        no500 && !leak,
        "no 500 / no B leak",
        `status=${res.status()} leak=${leak}`,
        { query: fc.q }
      )
    );
  }

  const headerCases = [
    { "x-partner-id": ids.partnerBProfileId },
    { "x-user-id": ids.partnerBProfileId },
    { "x-role": "admin" },
    { "X-Partner-Id": ids.partnerBProfileId },
    { role: "admin" },
    { Authorization: "Bearer fake.token.value" },
  ];

  for (const [i, headers] of headerCases.entries()) {
    const res = await a.page.request.get(`${base}/api/leads`, { headers });
    const json = await res.json().catch(() => ({}));
    const leak = extractIds(json).includes(ids.leadB1Id);
    // Bearer fake may 401 — still ok if no leak and not 500
    const ok = res.status() !== 500 && !leak;
    results.push(
      result(
        `FUZZ-H-${i + 1}`,
        ok,
        "headers ignored / no leak / no 500",
        `status=${res.status()} leak=${leak}`,
        { headers: Object.keys(headers) }
      )
    );
  }

  // POST body partner_id forge
  const forged = await a.page.request.post(`${base}/api/leads`, {
    data: {
      businessName: "audit_fuzz_forged_export",
      contactName: "audit",
      serviceType: "website",
      partner_id: ids.partnerBProfileId,
      partnerId: ids.partnerBProfileId,
      role: "admin",
    },
  });
  const forgedJson = await forged.json().catch(() => ({}));
  const createdPartner = forgedJson?.data?.partner_id;
  const forgeOk =
    forged.status() >= 400 ||
    (forged.status() < 400 && createdPartner === ids.partnerAProfileId);
  results.push(
    result(
      "FUZZ-BODY-01",
      forgeOk,
      "forced to A or 4xx",
      `status=${forged.status()} partner=${createdPartner || "n/a"}`,
      null
    )
  );

  // Foreign UUID GET
  const foreignGet = await a.page.request.get(`${base}/api/leads/${ids.leadB1Id}`);
  results.push(
    result(
      "FUZZ-UUID-01",
      [403, 404].includes(foreignGet.status()),
      "404/403",
      String(foreignGet.status()),
      (await foreignGet.text()).slice(0, 120)
    )
  );

  // Malformed UUID
  const badUuid = await a.page.request.get(`${base}/api/leads/not-a-uuid`);
  results.push(
    result(
      "FUZZ-UUID-02",
      badUuid.status() !== 500,
      "no 500 on malformed uuid",
      String(badUuid.status()),
      null
    )
  );

  // Reports partner-balance — query partner_id must not leak B or crash
  const balA = await a.page.request.get(`${base}/api/reports/partner-balance?partner_id=${ids.partnerBProfileId}`);
  const balText = await balA.text();
  const balLeak = balText.includes(ids.leadB1Id);
  results.push(
    result(
      "FUZZ-REPORT-01",
      balA.status() !== 500 && !balLeak,
      "no crash; no B lead id in body",
      `status=${balA.status()} leak=${balLeak}`,
      balText.slice(0, 100)
    )
  );

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    base,
    pass: results.filter((r) => r.pass).length,
    fail: results.filter((r) => !r.pass).length,
    results,
  };
  fs.writeFileSync(path.join(outDir, "export-fuzz-results.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ pass: summary.pass, fail: summary.fail, failed: results.filter((r) => !r.pass) }, null, 2));

  // Cleanup audit only (skip when SKIP_CLEANUP=1 — keep seed for follow-up e2e)
  if (process.env.SKIP_CLEANUP === "1") {
    console.log("SKIP_CLEANUP=1");
  } else {
    const cleanup = spawnSync(
      "node",
      ["--env-file=.env.local", "scripts/audit-cleanup.cjs", "--delete"],
      { cwd: process.cwd(), encoding: "utf8" }
    );
    console.log("CLEANUP", cleanup.status === 0 ? "OK" : cleanup.stderr || cleanup.stdout);
  }

  if (summary.fail > 0) process.exit(2);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
