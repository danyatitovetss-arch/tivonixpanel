/**
 * Smoke tests for partner self-registration against local server.
 * Usage: node --env-file=.env.local scripts/smoke-partner-registration.cjs
 */
const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const stamp = Date.now();

async function req(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function basePayload(over = {}) {
  return {
    fullName: "Smoke Test User",
    agencyName: null,
    telegram: "@smoke_test_user",
    email: `smoke.referral.${stamp}@mailinator.com`,
    websiteUrl: null,
    password: "Password1!",
    confirmPassword: "Password1!",
    partnerType: "referral",
    acceptTerms: true,
    ...over,
  };
}

(async () => {
  let failed = 0;
  const results = [];

  function ok(name, pass, detail) {
    results.push({ name, pass, detail });
    console.log(`${pass ? "OK" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
    if (!pass) failed += 1;
  }

  // 1) validation reject
  {
    const r = await req("/api/auth/register", basePayload({ password: "short", confirmPassword: "short" }));
    ok("rejects short password", r.status === 400, `status=${r.status}`);
  }

  // 2) privileged fields ignored / still pending partner
  {
    const email = `smoke.referral.${stamp}@mailinator.com`;
    const r = await req(
      "/api/auth/register",
      basePayload({
        email,
        role: "admin",
        status: "active",
        partnerType: "referral",
      })
    );
    ok(
      "registers referral",
      r.status === 200 && r.json?.data?.status === "pending" && r.json?.data?.partnerType === "referral",
      `status=${r.status} body=${JSON.stringify(r.json)}`
    );
  }

  // 3) white_label
  {
    const email = `smoke.wl.${stamp}@mailinator.com`;
    const r = await req(
      "/api/auth/register",
      basePayload({
        email,
        partnerType: "white_label",
        agencyName: "Smoke Agency",
        telegram: "@smoke_wl",
      })
    );
    ok(
      "registers white_label",
      r.status === 200 && r.json?.data?.partnerType === "white_label",
      `status=${r.status} body=${JSON.stringify(r.json)}`
    );
  }

  // 4) duplicate email
  {
    const email = `smoke.referral.${stamp}@mailinator.com`;
    const r = await req("/api/auth/register", basePayload({ email, telegram: "@smoke_dup" }));
    ok("rejects duplicate email", r.status === 409, `status=${r.status}`);
  }

  // 5) terms required
  {
    const r = await req(
      "/api/auth/register",
      basePayload({ email: `smoke+terms+${stamp}@example.com`, acceptTerms: false })
    );
    ok("rejects missing terms", r.status === 400, `status=${r.status}`);
  }

  console.log("---");
  if (failed) {
    console.error(`SMOKE FAILED: ${failed} checks`);
    process.exit(1);
  }
  console.log("SMOKE PASSED");
})().catch((e) => {
  console.error("SMOKE ERROR:", e.message);
  process.exit(1);
});
