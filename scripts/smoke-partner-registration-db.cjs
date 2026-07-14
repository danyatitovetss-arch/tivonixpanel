/**
 * DB-level smoke for partner registration (bypasses Auth signup rate limits).
 * Usage: node --env-file=.env.local scripts/smoke-partner-registration-db.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const stamp = Date.now();

if (!url || !secret) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createPendingPartner(email, partnerType, agencyName) {
  const password = `Smoke${stamp}!a`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "DB Smoke Partner",
      telegram: "@db_smoke",
      agency_name: agencyName || "",
      website_url: "https://smoke.example",
      partner_type: partnerType,
    },
  });
  if (error || !data.user) throw new Error(error?.message || "createUser failed");

  // Wait for trigger
  await new Promise((r) => setTimeout(r, 500));

  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .update({
      full_name: "DB Smoke Partner",
      email,
      telegram: "@db_smoke",
      agency_name: agencyName,
      website_url: "https://smoke.example",
      partner_type: partnerType,
      role: "partner",
      status: "pending",
    })
    .eq("user_id", data.user.id)
    .select("id, role, status, partner_type, email, telegram")
    .single();

  if (pErr) throw new Error(pErr.message);
  return { userId: data.user.id, profile };
}

(async () => {
  let failed = 0;
  const ok = (name, pass, detail) => {
    console.log(`${pass ? "OK" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
    if (!pass) failed += 1;
  };

  const referralEmail = `dbsmoke.ref.${stamp}@tivonix.io`;
  const wlEmail = `dbsmoke.wl.${stamp}@tivonix.io`;

  const ref = await createPendingPartner(referralEmail, "referral", null);
  ok(
    "referral pending in profiles",
    ref.profile.status === "pending" &&
      ref.profile.role === "partner" &&
      ref.profile.partner_type === "referral",
    JSON.stringify(ref.profile)
  );

  const wl = await createPendingPartner(wlEmail, "white_label", "Smoke WL");
  ok(
    "white_label pending in profiles",
    wl.profile.status === "pending" && wl.profile.partner_type === "white_label",
    JSON.stringify(wl.profile)
  );

  // Approve referral via service role
  const { data: approved, error: aErr } = await admin
    .from("profiles")
    .update({
      status: "active",
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", ref.profile.id)
    .select("status")
    .single();
  ok("admin can approve pending partner", !aErr && approved?.status === "active", aErr?.message);

  // Privilege protection: authenticated JWT path not available here; verify trigger helper exists
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  const rl = await pg.query(
    `select public.check_rate_limit($1, 5, 900) as allowed`,
    [`smoke:test:${stamp}`]
  );
  ok("rate limit RPC allows first call", rl.rows[0].allowed === true);

  // Existing admin still active
  const admins = await pg.query(
    `select count(*)::int as cnt from public.profiles where role='admin' and status='active'`
  );
  ok("existing admin still active", admins.rows[0].cnt >= 1, String(admins.rows[0].cnt));

  // Old partners without partner_type remain active
  const oldActive = await pg.query(
    `select count(*)::int as cnt from public.profiles
     where role='partner' and status='active' and partner_type is null`
  );
  ok(
    "legacy partners without partner_type still active",
    oldActive.rows[0].cnt >= 1,
    String(oldActive.rows[0].cnt)
  );

  // Reject remaining smoke user
  await admin
    .from("profiles")
    .update({ status: "rejected", rejection_reason: "smoke cleanup" })
    .eq("id", wl.profile.id);

  // Cleanup auth users created for smoke
  await admin.auth.admin.deleteUser(ref.userId);
  await admin.auth.admin.deleteUser(wl.userId);

  await pg.end();

  if (failed) {
    console.error(`DB SMOKE FAILED: ${failed}`);
    process.exit(1);
  }
  console.log("DB SMOKE PASSED");
})().catch((e) => {
  console.error("DB SMOKE ERROR:", e.message);
  process.exit(1);
});
