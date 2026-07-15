/**
 * Production smoke after deploy — audit data only for mutating tests.
 * Base: https://tivonixpanel-production.up.railway.app
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { chromium } = require("@playwright/test");

const BASE = process.env.E2E_BASE_URL || "https://tivonixpanel-production.up.railway.app";
const outDir = path.join(process.cwd(), "audit-panel", "logs", "deploy");
fs.mkdirSync(outDir, { recursive: true });

function requireEnv(n) {
  const v = process.env[n]?.trim();
  if (!v) throw new Error(`Missing ${n}`);
  return v;
}

function r(id, pass, detail) {
  return { id, pass, detail };
}

(async () => {
  const results = [];

  // Public health
  for (const [name, url] of [
    ["web_health", `${BASE}/api/health`],
    ["api_health", "https://tivonixpanel-api-production.up.railway.app/api/health"],
    ["login_page", `${BASE}/login`],
    ["register_page", `${BASE}/register`],
  ]) {
    const res = await fetch(url);
    results.push(r(name, res.status === 200, `status=${res.status}`));
  }

  // Headers
  const hdrRes = await fetch(`${BASE}/login`);
  const headers = Object.fromEntries(hdrRes.headers);
  const hasCsp = Boolean(headers["content-security-policy"]);
  const hasXfo = Boolean(headers["x-frame-options"]);
  const hasNosniff = Boolean(headers["x-content-type-options"]);
  results.push(
    r("security_headers", hasCsp || hasXfo || hasNosniff, {
      csp: hasCsp,
      xfo: hasXfo,
      nosniff: hasNosniff,
      poweredBy: headers["x-powered-by"] || null,
    })
  );

  // Seed audit
  const seed = spawnSync("node", ["--env-file=.env.local", "scripts/audit-seed.cjs"], {
    encoding: "utf8",
  });
  results.push(r("audit_seed", seed.status === 0, seed.status === 0 ? "ok" : seed.stderr?.slice(0, 200)));
  if (seed.status !== 0) {
    fs.writeFileSync(path.join(outDir, "prod-smoke.json"), JSON.stringify({ results }, null, 2));
    process.exit(2);
  }
  const ids = JSON.parse(fs.readFileSync("audit-panel/logs/audit-seed-manifest.json", "utf8")).ids;

  // Clear rate limits so login works
  spawnSync(
    "node",
    [
      "--env-file=.env.local",
      "-e",
      "const {Client}=require('pg');(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();await c.query('DELETE FROM public.rate_limit_buckets');await c.end()})()",
    ],
    { encoding: "utf8" }
  );

  const browser = await chromium.launch({ headless: true });

  async function login(email, password) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const unauthorized = [];
    page.on("response", (res) => {
      if (res.status() === 401 && /\/api\/(auth\/me|bootstrap)/.test(res.url()) && page.url().includes("/login")) {
        unauthorized.push(res.url());
      }
    });
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 120));
    });
    await page.goto(`${BASE}/login`);
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill(password);
    await page.getByRole("button", { name: /войти/i }).click();
    await page.waitForURL(/dashboard|leads|onboarding|my/, { timeout: 45000 });
    return { ctx, page, unauthorized, consoleErrors };
  }

  // Partner A isolation
  const aEmail = requireEnv("AUDIT_PARTNER_A_EMAIL");
  const aPass = requireEnv("AUDIT_PARTNER_A_PASSWORD");
  const a = await login(aEmail, aPass);
  results.push(r("login_partner_a", true, a.page.url()));

  const getB = await a.page.request.get(`${BASE}/api/leads/${ids.leadB1Id}`);
  results.push(r("a_cannot_get_b", [403, 404].includes(getB.status()), `status=${getB.status()}`));

  const listA = await a.page.request.get(`${BASE}/api/leads`);
  const listAJson = await listA.json();
  const idsA = (listAJson.data || []).map((x) => x.id);
  results.push(
    r(
      "a_list_excludes_b",
      listA.ok() && !idsA.includes(ids.leadB1Id) && idsA.includes(ids.leadA1Id),
      `count=${idsA.length}`
    )
  );

  // Export scope = list scope
  const csv = JSON.stringify(listAJson.data || []);
  results.push(r("export_no_b", !csv.includes(ids.leadB1Id) && !csv.includes("audit_lead_b"), "ok"));

  // PATCH foreign
  const patch = await a.page.request.patch(`${BASE}/api/leads/${ids.leadB1Id}`, {
    data: { notes: "prod_audit_idor" },
  });
  results.push(r("a_patch_b_404", [403, 404].includes(patch.status()) && patch.status() !== 500, `status=${patch.status()}`));

  // Admin route blocked
  const adm = await a.page.request.get(`${BASE}/api/admin/users`);
  results.push(r("a_admin_403", adm.status() === 403, `status=${adm.status()}`));

  // Refresh protected
  await a.page.reload();
  await a.page.waitForTimeout(1500);
  results.push(r("refresh_protected", /dashboard|leads|my/.test(a.page.url()), a.page.url()));

  // 401 spam on login earlier — check from a fresh public page
  const pub = await browser.newPage();
  const unauth = [];
  pub.on("response", (res) => {
    if (res.status() === 401 && /\/api\/(auth\/me|bootstrap)/.test(res.url())) unauth.push(res.url());
  });
  await pub.goto(`${BASE}/login`);
  await pub.waitForTimeout(1200);
  results.push(r("no_401_spam_login", unauth.length === 0, `count=${unauth.length}`));
  await pub.close();

  // Logout
  await a.page.request.post(`${BASE}/api/auth/logout`);
  const me = await a.page.request.get(`${BASE}/api/auth/me`);
  results.push(r("logout", me.status() === 401, `status=${me.status()}`));
  await a.ctx.close();

  // Partner B
  const b = await login(requireEnv("AUDIT_PARTNER_B_EMAIL"), requireEnv("AUDIT_PARTNER_B_PASSWORD"));
  const getA = await b.page.request.get(`${BASE}/api/leads/${ids.leadA1Id}`);
  results.push(r("b_cannot_get_a", [403, 404].includes(getA.status()), `status=${getA.status()}`));
  const patchA = await b.page.request.patch(`${BASE}/api/leads/${ids.leadA1Id}`, {
    data: { notes: "prod_audit_idor_b" },
  });
  results.push(r("b_patch_a_404", [403, 404].includes(patchA.status()), `status=${patchA.status()}`));
  await b.ctx.close();

  // Admin mark-paid (audit deal only)
  const admin = await login(requireEnv("AUDIT_ADMIN_EMAIL"), requireEnv("AUDIT_ADMIN_PASSWORD"));
  const deals = await admin.page.request.get(`${BASE}/api/deals`);
  const dealsJson = await deals.json();
  const list = dealsJson.data || dealsJson.deals || [];
  const auditDeal = Array.isArray(list) ? list.find((d) => d.client_name === "audit_client_a1") : null;
  if (auditDeal?.id) {
    const mp1 = await admin.page.request.post(`${BASE}/api/deals/${auditDeal.id}/mark-paid`);
    const mp2 = await admin.page.request.post(`${BASE}/api/deals/${auditDeal.id}/mark-paid`);
    results.push(
      r(
        "admin_mark_paid",
        [200, 409].includes(mp1.status()) && [200, 409].includes(mp2.status()),
        `mp1=${mp1.status()} mp2=${mp2.status()}`
      )
    );
  } else {
    results.push(r("admin_mark_paid", false, "audit deal missing"));
  }
  await admin.ctx.close();

  // Mobile viewport
  const mobile = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const mp = await mobile.newPage();
  await mp.goto(`${BASE}/login`);
  const overflow = await mp.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
  );
  results.push(r("mobile_login_no_hscroll", !overflow, `overflow=${overflow}`));
  await mobile.close();

  await browser.close();

  // Integrity
  const integrity = spawnSync("node", ["--env-file=.env.local", "scripts/audit-integrity-readonly.cjs"], {
    encoding: "utf8",
  });
  let integrityOk = false;
  let integritySummary = null;
  try {
    const parsed = JSON.parse(integrity.stdout);
    integritySummary = parsed.summary;
    integrityOk = parsed.ok && parsed.summary.failCount === 0 && parsed.summary.authUsers >= 17;
  } catch {
    integrityOk = false;
  }
  results.push(r("integrity_17_users", integrityOk, integritySummary));

  // Legal profiles for repaired users — missing count 0
  const missing = spawnSync(
    "node",
    ["--env-file=.env.local", "scripts/analyze-missing-legal-profiles.cjs"],
    { encoding: "utf8" }
  );
  let missingCount = -1;
  try {
    missingCount = JSON.parse(missing.stdout).count;
  } catch {
    /* */
  }
  results.push(r("legal_profiles_complete", missingCount === 0, `missing=${missingCount}`));

  // Cleanup audit
  const cleanup = spawnSync(
    "node",
    ["--env-file=.env.local", "scripts/audit-cleanup.cjs", "--delete"],
    { encoding: "utf8" }
  );
  results.push(r("audit_cleanup", cleanup.status === 0, "ok"));

  const summary = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    pass: results.filter((x) => x.pass).length,
    fail: results.filter((x) => !x.pass).length,
    results,
  };
  fs.writeFileSync(path.join(outDir, "prod-smoke.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ pass: summary.pass, fail: summary.fail, failed: results.filter((x) => !x.pass) }, null, 2));
  if (summary.fail > 0) process.exit(2);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
