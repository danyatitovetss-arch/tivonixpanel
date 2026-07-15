/**
 * Pre-release audit crawler: public routes + viewport screenshots + console/network capture.
 * Usage: node audit-panel/audit-playwright.mjs [baseUrl]
 */
import { chromium, devices } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const SHOTS = path.join(__dirname, "screenshots");
const LOGS = path.join(__dirname, "logs");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(LOGS, { recursive: true });

const VIEWPORTS = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/register?type=referral",
  "/register?type=white_label",
  "/forgot-password",
  "/auth/reset-password",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/partner-agreement",
  "/legal/commission-rules",
  "/legal/personal-data-consent",
  "/this-page-does-not-exist-404",
];

const PROTECTED_ROUTES = [
  "/dashboard",
  "/my",
  "/academy",
  "/prospecting",
  "/leads",
  "/leads/new",
  "/deals",
  "/partners",
  "/payouts",
  "/reports",
  "/settings",
  "/admin/legal-profiles",
  "/admin/partner-applications",
  "/admin/audit-logs",
  "/pending",
  "/blocked",
  "/onboarding/legal",
  "/onboarding/set-password",
];

const report = {
  base: BASE,
  startedAt: new Date().toISOString(),
  routes: [],
  viewports: [],
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  overflows: [],
  summary: {},
};

function slug(route) {
  return route.replace(/[/?=&]/g, "_").replace(/^_/, "") || "root";
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflow: doc.scrollWidth > doc.clientWidth + 2,
    };
  });
}

async function collectRoute(page, route, kind) {
  const entry = {
    route,
    kind,
    ok: true,
    finalUrl: "",
    status: null,
    title: "",
    redirectToLogin: false,
    httpError: false,
    overflow: false,
    console: [],
    networkFails: [],
    durationMs: 0,
  };
  const consoleMsgs = [];
  const networkFails = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") consoleMsgs.push(msg.text());
  };
  const onPageError = (err) => {
    report.pageErrors.push({ route, message: err.message });
  };
  const onRequestFailed = (req) => {
    networkFails.push({ url: req.url(), failure: req.failure()?.errorText });
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  const t0 = Date.now();
  let res;
  try {
    res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    entry.ok = false;
    entry.error = String(e);
    report.routes.push(entry);
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
    return entry;
  }
  entry.durationMs = Date.now() - t0;
  entry.status = res?.status() ?? null;
  entry.finalUrl = page.url();
  entry.title = await page.title().catch(() => "");
  entry.redirectToLogin = /\/login/i.test(entry.finalUrl);
  entry.httpError = (entry.status ?? 0) >= 400;
  await page.waitForTimeout(400);
  const overflow = await checkOverflow(page);
  entry.overflow = overflow.overflow;
  entry.console = consoleMsgs;
  entry.networkFails = networkFails;
  if (consoleMsgs.length) report.consoleErrors.push({ route, msgs: consoleMsgs });
  if (networkFails.length) report.failedRequests.push({ route, fails: networkFails });
  if (overflow.overflow) report.overflows.push({ route, ...overflow });

  const shotName = `${kind}_${slug(route)}.png`;
  await page.screenshot({ path: path.join(SHOTS, shotName), fullPage: false });
  entry.screenshot = shotName;

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  report.routes.push(entry);
  return entry;
}

async function viewportMatrix(browser) {
  const routesForMatrix = ["/login", "/register", "/forgot-password", "/legal/privacy"];
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const vpReport = { name: vp.name, routes: [] };
    for (const route of routesForMatrix) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(300);
      const overflow = await checkOverflow(page);
      const file = `vp_${vp.name}_${slug(route)}.png`;
      await page.screenshot({ path: path.join(SHOTS, file), fullPage: false });
      // touch targets: buttons < 44px
      const smallTargets = await page.evaluate(() => {
        const els = [...document.querySelectorAll("button, a, input, [role='button']")];
        return els
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { tag: el.tagName, text: (el.textContent || "").trim().slice(0, 40), w: r.width, h: r.height };
          })
          .filter((t) => t.w > 0 && t.h > 0 && (t.w < 40 || t.h < 40))
          .slice(0, 15);
      });
      vpReport.routes.push({ route, overflow: overflow.overflow, screenshot: file, smallTargets });
    }
    report.viewports.push(vpReport);
    await context.close();
  }
}

async function interactiveChecks(page) {
  const checks = [];

  // Bad login
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"], input[name="email"]', "wrong@example.com").catch(() => {});
  await page.fill('input[type="password"], input[name="password"]', "wrongpassword").catch(() => {});
  await page.getByRole("button", { name: /войти|вход|login/i }).click().catch(() => {});
  await page.waitForTimeout(1500);
  const loginBody = await page.locator("body").innerText();
  checks.push({
    name: "invalid_login_shows_error",
    pass: /неверн|ошибк|invalid|парол/i.test(loginBody),
    snippet: loginBody.slice(0, 400),
  });
  await page.screenshot({ path: path.join(SHOTS, "flow_invalid_login.png") });

  // Double submit register validation
  await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  const submit = page.getByRole("button", { name: /отправ|заявк|регистр|создат/i }).first();
  if (await submit.count()) {
    await submit.click();
    await page.waitForTimeout(300);
    await submit.click().catch(() => {});
    await page.waitForTimeout(500);
    const text = await page.locator("body").innerText();
    checks.push({
      name: "empty_register_validation",
      pass: /обязател|заполн|required|email|парол|имя/i.test(text),
      snippet: text.slice(0, 500),
    });
    await page.screenshot({ path: path.join(SHOTS, "flow_register_empty.png") });
  }

  // Forgot password empty
  await page.goto(`${BASE}/forgot-password`, { waitUntil: "domcontentloaded" });
  const forgotBtn = page.getByRole("button").first();
  await forgotBtn.click().catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, "flow_forgot_password.png") });

  // API checks without auth
  const apiChecks = [];
  for (const ep of ["/api/health", "/api/auth/me", "/api/bootstrap", "/api/leads", "/api/admin/users"]) {
    const r = await page.request.get(`${BASE}${ep}`);
    apiChecks.push({ ep, status: r.status(), body: (await r.text()).slice(0, 200) });
  }
  checks.push({ name: "api_unauth", apiChecks });

  report.interactive = checks;
}

async function main() {
  console.log("Audit base:", BASE);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const route of PUBLIC_ROUTES) {
    console.log("public", route);
    await collectRoute(page, route, "public");
  }
  for (const route of PROTECTED_ROUTES) {
    console.log("protected", route);
    await collectRoute(page, route, "protected");
  }

  console.log("interactive…");
  await interactiveChecks(page);
  await context.close();

  console.log("viewports…");
  await viewportMatrix(browser);

  // Production-specific extra if probing remote
  if (/railway\.app/.test(BASE)) {
    const page2 = await (await browser.newContext()).newPage();
    await page2.goto(BASE + "/login");
    const mixed = await page2.evaluate(() =>
      [...document.querySelectorAll("img,script,link,iframe")]
        .map((el) => el.src || el.href)
        .filter((u) => typeof u === "string" && u.startsWith("http://"))
    );
    report.mixedContent = mixed;
    await page2.close();
  }

  await browser.close();

  report.finishedAt = new Date().toISOString();
  report.summary = {
    routesChecked: report.routes.length,
    publicOk: report.routes.filter((r) => r.kind === "public" && r.ok && !r.httpError).length,
    protectedRedirectLogin: report.routes.filter((r) => r.kind === "protected" && r.redirectToLogin).length,
    protectedNotRedirected: report.routes.filter((r) => r.kind === "protected" && !r.redirectToLogin).map((r) => r.route),
    consoleErrorRoutes: report.consoleErrors.length,
    overflowRoutes: report.overflows.length,
    pageErrors: report.pageErrors.length,
  };

  const out = path.join(LOGS, "playwright-audit.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log("Wrote", out);
  console.log(JSON.stringify(report.summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
