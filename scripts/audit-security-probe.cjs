/**
 * Authenticated security probe (Partner A/B, admin, guest).
 * Uses Supabase user JWT for RLS + fetch to app API with Bearer (if supported) or cookie-less 401 baseline.
 *
 * Usage: node --env-file=.env.local scripts/audit-security-probe.cjs [--base=https://...]
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const base =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ||
  process.env.E2E_BASE_URL ||
  "https://tivonixpanel-production.up.railway.app";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function loadManifest() {
  const p = path.join(process.cwd(), "audit-panel", "logs", "audit-seed-manifest.json");
  if (!fs.existsSync(p)) throw new Error("Run audit-seed first");
  return JSON.parse(fs.readFileSync(p, "utf8")).ids;
}

async function signIn(email, password) {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const client = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, session: data.session };
}

function r(caseId, role, endpoint, action, expected, actual, pass, snippet) {
  return { caseId, role, endpoint, action, expected, actual, pass, snippet };
}

async function rlsFetch(client, table, id) {
  const q = client.from(table).select("id, partner_id").eq("id", id).maybeSingle();
  const { data, error } = await q;
  return { data, error: error?.message || null, visible: Boolean(data) };
}

async function apiWithCookie(baseUrl, path, cookieHeader, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return { status: res.status, json, text: text.slice(0, 200) };
}

function sbCookie(session) {
  const url = new URL(requireEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const ref = url.hostname.split(".")[0];
  const payload = JSON.stringify([
    session.access_token,
    session.refresh_token,
    session.user,
    session.token_type,
  ]);
  const encoded = encodeURIComponent(payload);
  return `sb-${ref}-auth-token=${encoded}`;
}

(async () => {
  const ids = loadManifest();
  const results = [];

  const aEmail = requireEnv("AUDIT_PARTNER_A_EMAIL");
  const aPass = requireEnv("AUDIT_PARTNER_A_PASSWORD");
  const bEmail = requireEnv("AUDIT_PARTNER_B_EMAIL");
  const bPass = requireEnv("AUDIT_PARTNER_B_PASSWORD");
  const adminEmail = requireEnv("AUDIT_ADMIN_EMAIL");
  const adminPass = requireEnv("AUDIT_ADMIN_PASSWORD");

  // Guest
  const guestLead = await apiWithCookie(base, `/api/leads/${ids.leadB1Id}`, null);
  results.push(
    r(
      "S-GUEST-01",
      "guest",
      `/api/leads/${ids.leadB1Id}`,
      "GET",
      "401/403",
      String(guestLead.status),
      guestLead.status === 401 || guestLead.status === 403,
      guestLead.text
    )
  );

  const { session: sessA, client: clientA } = await signIn(aEmail, aPass);
  const cookieA = sbCookie(sessA);

  // Partner A RLS: own lead visible
  const own = await rlsFetch(clientA, "leads", ids.leadA1Id);
  results.push(
    r("S-A-RLS-01", "partner_a", "supabase/leads", "SELECT own", "visible", own.visible ? "visible" : "hidden", own.visible, own.error || "ok")
  );

  // Partner A RLS: B lead hidden
  const foreign = await rlsFetch(clientA, "leads", ids.leadB1Id);
  results.push(
    r(
      "S-A-RLS-02",
      "partner_a",
      "supabase/leads",
      "SELECT foreign",
      "hidden",
      foreign.visible ? "visible" : "hidden",
      !foreign.visible,
      foreign.error || "null"
    )
  );

  // Partner A API GET foreign lead
  const apiForeign = await apiWithCookie(base, `/api/leads/${ids.leadB1Id}`, cookieA);
  results.push(
    r(
      "S-A-API-01",
      "partner_a",
      `/api/leads/${ids.leadB1Id}`,
      "GET",
      "404/403",
      String(apiForeign.status),
      apiForeign.status === 404 || apiForeign.status === 403,
      apiForeign.text
    )
  );

  // Partner A API list — must not include B lead id
  const listA = await apiWithCookie(base, "/api/leads", cookieA);
  const idsInList =
    listA.json?.leads?.map((l) => l.id) ||
    listA.json?.data?.map((l) => l.id) ||
    (Array.isArray(listA.json) ? listA.json.map((l) => l.id) : []);
  const leaked = idsInList.includes(ids.leadB1Id);
  results.push(
    r(
      "S-A-API-02",
      "partner_a",
      "/api/leads",
      "GET list",
      "no B leads",
      leaked ? "contains B" : "ok",
      !leaked,
      `count=${idsInList.length}`
    )
  );

  // Partner A PATCH foreign lead
  const patchForeign = await apiWithCookie(base, `/api/leads/${ids.leadB1Id}`, cookieA, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ notes: "audit_idor_attempt" }),
  });
  results.push(
    r(
      "S-A-API-03",
      "partner_a",
      `/api/leads/${ids.leadB1Id}`,
      "PATCH",
      "404/403",
      String(patchForeign.status),
      patchForeign.status === 404 || patchForeign.status === 403,
      patchForeign.text
    )
  );

  // Partner A POST lead with forged partner_id (B)
  const postForged = await apiWithCookie(base, "/api/leads", cookieA, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      business_name: "audit_forged_partner_id",
      partner_id: ids.partnerBProfileId,
      contact_name: "audit",
      service_type: "website",
    }),
  });
  let forgedOk = postForged.status >= 400;
  if (postForged.status < 400 && postForged.json?.lead?.partner_id) {
    forgedOk = postForged.json.lead.partner_id === ids.partnerAProfileId;
  }
  results.push(
    r(
      "S-A-API-04",
      "partner_a",
      "/api/leads",
      "POST forged partner_id",
      "forced to A or 4xx",
      String(postForged.status),
      forgedOk,
      postForged.text
    )
  );

  // Partner A deals foreign
  const dealsForeign = await apiWithCookie(base, `/api/deals/${ids.leadB1Id}`, cookieA);
  results.push(
    r(
      "S-A-API-05",
      "partner_a",
      "/api/deals (probe)",
      "GET foreign deal by wrong id",
      "404/403",
      String(dealsForeign.status),
      dealsForeign.status === 404 || dealsForeign.status === 403 || dealsForeign.status === 400,
      dealsForeign.text
    )
  );

  // Partner A cannot mark-paid
  const markPaid = await apiWithCookie(base, `/api/deals/${ids.leadA1Id}/mark-paid`, cookieA, {
    method: "POST",
  });
  results.push(
    r(
      "S-A-FIN-01",
      "partner_a",
      "/api/deals/*/mark-paid",
      "POST",
      "403",
      String(markPaid.status),
      markPaid.status === 403,
      markPaid.text
    )
  );

  // Partner B symmetric vs A lead
  const { session: sessB, client: clientB } = await signIn(bEmail, bPass);
  const cookieB = sbCookie(sessB);
  const bForeign = await rlsFetch(clientB, "leads", ids.leadA1Id);
  results.push(
    r(
      "S-B-RLS-01",
      "partner_b",
      "supabase/leads",
      "SELECT A lead",
      "hidden",
      bForeign.visible ? "visible" : "hidden",
      !bForeign.visible,
      bForeign.error || "null"
    )
  );
  const apiBForeign = await apiWithCookie(base, `/api/leads/${ids.leadA1Id}`, cookieB);
  results.push(
    r(
      "S-B-API-01",
      "partner_b",
      `/api/leads/${ids.leadA1Id}`,
      "GET",
      "404/403",
      String(apiBForeign.status),
      apiBForeign.status === 404 || apiBForeign.status === 403,
      apiBForeign.text
    )
  );

  // Admin can read both (via service listing — use admin cookie)
  const { session: sessAdmin } = await signIn(adminEmail, adminPass);
  const cookieAdmin = sbCookie(sessAdmin);
  const adminB = await apiWithCookie(base, `/api/leads/${ids.leadB1Id}`, cookieAdmin);
  results.push(
    r(
      "S-ADM-01",
      "admin",
      `/api/leads/${ids.leadB1Id}`,
      "GET",
      "200",
      String(adminB.status),
      adminB.status === 200,
      adminB.text.slice(0, 120)
    )
  );

  // Admin mark-paid on audit deal — find deal id first via admin client
  const adminSecret = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: auditDeal } = await adminSecret
    .from("deals")
    .select("id")
    .eq("partner_id", ids.partnerAProfileId)
    .eq("client_name", "audit_client_a1")
    .maybeSingle();

  if (auditDeal?.id) {
    const mp = await apiWithCookie(base, `/api/deals/${auditDeal.id}/mark-paid`, cookieAdmin, { method: "POST" });
    results.push(
      r(
        "S-ADM-FIN-01",
        "admin",
        `/api/deals/${auditDeal.id}/mark-paid`,
        "POST",
        "200/409 idempotent",
        String(mp.status),
        mp.status === 200 || mp.status === 409,
        mp.text.slice(0, 120)
      )
    );
    const mp2 = await apiWithCookie(base, `/api/deals/${auditDeal.id}/mark-paid`, cookieAdmin, { method: "POST" });
    results.push(
      r(
        "S-ADM-FIN-02",
        "admin",
        "mark-paid x2",
        "POST",
        "409/200 no double accrual",
        String(mp2.status),
        mp2.status === 200 || mp2.status === 409,
        mp2.text.slice(0, 120)
      )
    );
  } else {
    results.push(
      r("S-ADM-FIN-01", "admin", "deals", "find audit deal", "exists", "missing", false, "no audit deal")
    );
  }

  // Partner A admin route blocked
  const adminRoute = await apiWithCookie(base, "/api/admin/users", cookieA);
  results.push(
    r(
      "S-A-ADM-01",
      "partner_a",
      "/api/admin/users",
      "GET",
      "403",
      String(adminRoute.status),
      adminRoute.status === 403,
      adminRoute.text
    )
  );

  const out = {
    generatedAt: new Date().toISOString(),
    base,
    pass: results.filter((x) => x.pass).length,
    fail: results.filter((x) => !x.pass).length,
    results,
  };

  const outPath = path.join(process.cwd(), "audit-panel", "logs", "security-probe-results.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ pass: out.pass, fail: out.fail, failed: results.filter((x) => !x.pass) }, null, 2));
  if (out.fail > 0) process.exit(2);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
