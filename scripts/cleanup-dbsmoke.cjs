/**
 * List (and optionally delete) ONLY dbsmoke.*@tivonix.io smoke test accounts.
 * Usage:
 *   node --env-file=.env.local scripts/cleanup-dbsmoke.cjs --list
 *   node --env-file=.env.local scripts/cleanup-dbsmoke.cjs --delete
 */
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const MODE = process.argv.includes("--delete") ? "delete" : "list";
const EMAIL_PATTERN = /^dbsmoke\.[a-z0-9._-]+@tivonix\.io$/i;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!process.env.DATABASE_URL || !url || !secret) {
  console.error("Need DATABASE_URL, SUPABASE_URL, SUPABASE_SECRET_KEY");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: profiles } = await pg.query(
    `SELECT id, user_id, email, full_name, role, status, partner_type, created_at
     FROM public.profiles
     WHERE email ILIKE 'dbsmoke.%@tivonix.io'
     ORDER BY created_at`
  );

  const safe = profiles.filter((p) => EMAIL_PATTERN.test(p.email || ""));
  const rejected = profiles.filter((p) => !EMAIL_PATTERN.test(p.email || ""));

  console.log("=== SMOKE PROFILES (exact match) ===");
  console.log(JSON.stringify(safe, null, 2));
  if (rejected.length) {
    console.log("=== REJECTED (pattern mismatch, WILL NOT TOUCH) ===");
    console.log(JSON.stringify(rejected, null, 2));
  }

  const profileIds = safe.map((p) => p.id);
  const userIds = safe.map((p) => p.user_id).filter(Boolean);

  const { rows: authUsers } = await pg.query(
    `SELECT id, email, created_at
     FROM auth.users
     WHERE email ILIKE 'dbsmoke.%@tivonix.io'
     ORDER BY created_at`
  );
  const safeAuth = authUsers.filter((u) => EMAIL_PATTERN.test(u.email || ""));
  console.log("=== AUTH.USERS ===");
  console.log(JSON.stringify(safeAuth, null, 2));

  if (userIds.length) {
    for (const table of ["legal_acceptances", "consent_events", "user_legal_profiles"]) {
      try {
        const { rows } = await pg.query(
          `SELECT * FROM public.${table} WHERE user_id = ANY($1::uuid[])`,
          [userIds]
        );
        console.log(`=== ${table.toUpperCase()} (${rows.length}) ===`);
        console.log(JSON.stringify(rows, null, 2));
      } catch (e) {
        console.log(`=== ${table} ERR ===`, e.message);
      }
    }
  }

  if (profileIds.length) {
    const { rows: audits } = await pg.query(
      `SELECT id, action, entity_type, entity_id, actor_profile_id, created_at
       FROM public.audit_logs
       WHERE actor_profile_id = ANY($1::uuid[]) OR entity_id = ANY($1::uuid[])
       ORDER BY created_at`,
      [profileIds]
    );
    console.log(`=== AUDIT_LOGS (${audits.length}) ===`);
    console.log(JSON.stringify(audits, null, 2));

    for (const table of ["leads", "deals", "payouts", "balance_transactions", "prospect_contacts"]) {
      try {
        const { rows } = await pg.query(
          `SELECT id, partner_id FROM public.${table} WHERE partner_id = ANY($1::uuid[]) LIMIT 50`,
          [profileIds]
        );
        console.log(`=== ${table.toUpperCase()} by partner_id (${rows.length}) ===`);
        console.log(JSON.stringify(rows, null, 2));
      } catch (e) {
        console.log(`=== ${table} ERR ===`, e.message);
      }
    }
  }

  // migrations presence
  const mig = await pg.query(
    `SELECT
       EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='user_status' AND e.enumlabel='pending') AS has_pending,
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='partner_type') AS has_partner_type,
       EXISTS (SELECT 1 FROM pg_proc WHERE proname='check_rate_limit') AS has_rate_limit,
       EXISTS (SELECT 1 FROM pg_proc WHERE proname='protect_privileged_profile_fields') AS has_protect
    `
  );
  console.log("=== MIGRATION MARKERS ===");
  console.log(JSON.stringify(mig.rows[0], null, 2));

  const legacy = await pg.query(
    `SELECT count(*)::int AS cnt FROM public.profiles
     WHERE role='partner' AND status='active' AND partner_type IS NULL`
  );
  const admins = await pg.query(
    `SELECT id, email, status FROM public.profiles WHERE role='admin' ORDER BY created_at`
  );
  const activePartners = await pg.query(
    `SELECT count(*)::int AS cnt FROM public.profiles WHERE role='partner' AND status='active'`
  );
  console.log("=== LEGACY ACTIVE WITHOUT partner_type ===", legacy.rows[0].cnt);
  console.log("=== ACTIVE PARTNERS ===", activePartners.rows[0].cnt);
  console.log("=== ADMINS ===", JSON.stringify(admins.rows, null, 2));

  if (MODE !== "delete") {
    console.log("\nList-only mode. Re-run with --delete to remove ONLY the listed smoke accounts.");
    await pg.end();
    return;
  }

  if (!safe.length) {
    console.log("Nothing to delete.");
    await pg.end();
    return;
  }

  // Delete by exact IDs only
  for (const p of safe) {
    if (!EMAIL_PATTERN.test(p.email)) {
      throw new Error(`Refusing delete: email failed pattern ${p.email}`);
    }
  }

  console.log("\nDeleting related rows then auth users by exact IDs...");

  if (profileIds.length) {
    await pg.query(`DELETE FROM public.audit_logs WHERE actor_profile_id = ANY($1::uuid[]) OR entity_id = ANY($1::uuid[])`, [
      profileIds,
    ]);
  }
  if (userIds.length) {
    await pg.query(`DELETE FROM public.legal_acceptances WHERE user_id = ANY($1::uuid[])`, [userIds]);
    await pg.query(`DELETE FROM public.consent_events WHERE user_id = ANY($1::uuid[])`, [userIds]);
    await pg.query(`DELETE FROM public.user_legal_profiles WHERE user_id = ANY($1::uuid[])`, [userIds]);
  }

  // Remove business rows if any (should be empty for smoke)
  if (profileIds.length) {
    await pg.query(`DELETE FROM public.prospect_contacts WHERE partner_id = ANY($1::uuid[])`, [profileIds]);
    await pg.query(`DELETE FROM public.leads WHERE partner_id = ANY($1::uuid[])`, [profileIds]);
    // deals/payouts may cascade or FK — delete if present
    await pg.query(`DELETE FROM public.balance_transactions WHERE partner_id = ANY($1::uuid[])`, [profileIds]);
    await pg.query(`DELETE FROM public.payouts WHERE partner_id = ANY($1::uuid[])`, [profileIds]);
    await pg.query(`DELETE FROM public.deals WHERE partner_id = ANY($1::uuid[])`, [profileIds]);
  }

  // profiles: delete by exact ids
  const delProf = await pg.query(`DELETE FROM public.profiles WHERE id = ANY($1::uuid[]) RETURNING id, email`, [
    profileIds,
  ]);
  console.log("DELETED PROFILES", delProf.rows);

  // auth users via admin API by exact auth ids
  for (const u of safeAuth) {
    if (!EMAIL_PATTERN.test(u.email)) continue;
    const { error } = await admin.auth.admin.deleteUser(u.id);
    console.log(error ? `AUTH DELETE FAIL ${u.email}: ${error.message}` : `AUTH DELETED ${u.email} ${u.id}`);
  }

  // rate limit smoke buckets
  await pg.query(`DELETE FROM public.rate_limit_buckets WHERE bucket_key LIKE 'smoke:test:%'`);

  const remaining = await pg.query(
    `SELECT email FROM public.profiles WHERE email ILIKE 'dbsmoke.%@tivonix.io'
     UNION
     SELECT email FROM auth.users WHERE email ILIKE 'dbsmoke.%@tivonix.io'`
  );
  console.log("REMAINING SMOKE EMAILS", remaining.rows);

  await pg.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
