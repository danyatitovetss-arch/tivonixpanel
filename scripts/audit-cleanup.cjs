/**
 * Cleanup ONLY audit_* records (@tivonix.audit / name prefix audit_).
 * Supports --dry-run (default list) and --delete.
 * Refuses to delete anything not matching audit markers.
 */
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const DO_DELETE = process.argv.includes("--delete");
const DRY = !DO_DELETE || process.argv.includes("--dry-run");
const DOMAIN = "tivonix.audit";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

(async () => {
  const pg = new Client({
    connectionString: requireEnv("DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: profiles } = await pg.query(
    `SELECT id, user_id, email, full_name, role
     FROM public.profiles
     WHERE email ILIKE $1
        OR full_name ILIKE 'audit\\_%' ESCAPE '\\'
        OR partnership_notes ILIKE '%is_audit=true%'
     ORDER BY created_at`,
    [`%@${DOMAIN}`]
  );

  // Safety: every row must look like audit
  for (const p of profiles) {
    const emailOk = (p.email || "").toLowerCase().endsWith(`@${DOMAIN}`);
    const nameOk = (p.full_name || "").toLowerCase().startsWith("audit_");
    const noteOk = (p.partnership_notes || "").includes("is_audit=true");
    if (!emailOk && !nameOk && !noteOk) {
      throw new Error(`Safety abort: non-audit profile matched unexpectedly id=${p.id}`);
    }
    if (!emailOk) {
      throw new Error(`Safety abort: profile email not @${DOMAIN}: id=${p.id}`);
    }
  }

  const partnerIds = profiles.map((p) => p.id);
  const userIds = profiles.map((p) => p.user_id);

  const counts = { profiles: profiles.length };

  async function count(sql, params) {
    const { rows } = await pg.query(sql, params);
    return rows[0].n;
  }

  if (partnerIds.length) {
    counts.leads = await count(`SELECT count(*)::int AS n FROM public.leads WHERE partner_id = ANY($1)`, [partnerIds]);
    counts.deals = await count(`SELECT count(*)::int AS n FROM public.deals WHERE partner_id = ANY($1)`, [partnerIds]);
    counts.payouts = await count(`SELECT count(*)::int AS n FROM public.payouts WHERE partner_id = ANY($1)`, [partnerIds]);
    counts.balance_transactions = await count(
      `SELECT count(*)::int AS n FROM public.balance_transactions WHERE partner_id = ANY($1)`,
      [partnerIds]
    );
    counts.prospect_contacts = await count(
      `SELECT count(*)::int AS n FROM public.prospect_contacts WHERE partner_id = ANY($1)`,
      [partnerIds]
    );
    counts.lead_activities = await count(
      `SELECT count(*)::int AS n FROM public.lead_activities a
       JOIN public.leads l ON l.id = a.lead_id WHERE l.partner_id = ANY($1)`,
      [partnerIds]
    );
    counts.audit_named_leads = await count(
      `SELECT count(*)::int AS n FROM public.leads WHERE business_name ILIKE 'audit\\_%' ESCAPE '\\'`,
      []
    );
  } else {
    counts.leads = counts.deals = counts.payouts = counts.balance_transactions = counts.prospect_contacts = counts.lead_activities = 0;
  }

  console.log("AUDIT_CLEANUP_COUNTS", JSON.stringify(counts, null, 2));
  console.log(
    "PROFILES",
    profiles.map((p) => ({
      role: p.role,
      email: p.email.replace(/(.{1}).*(@.*)/, "$1***$2"),
      name: p.full_name,
    }))
  );

  if (!DO_DELETE || DRY) {
    console.log("Mode: dry-run / list only. Pass --delete to remove audit rows.");
    await pg.end();
    return;
  }

  if (!partnerIds.length) {
    console.log("Nothing to delete.");
    await pg.end();
    return;
  }

  // Delete order — only by audited partner_ids
  await pg.query(`DELETE FROM public.lead_activities WHERE lead_id IN (SELECT id FROM public.leads WHERE partner_id = ANY($1))`, [
    partnerIds,
  ]);
  await pg.query(`DELETE FROM public.prospect_activities WHERE prospect_id IN (SELECT id FROM public.prospect_contacts WHERE partner_id = ANY($1))`, [
    partnerIds,
  ]).catch(() => {});
  await pg.query(`DELETE FROM public.balance_transactions WHERE partner_id = ANY($1)`, [partnerIds]);
  await pg.query(`DELETE FROM public.payouts WHERE partner_id = ANY($1)`, [partnerIds]);
  await pg.query(`DELETE FROM public.deals WHERE partner_id = ANY($1)`, [partnerIds]);
  await pg.query(`DELETE FROM public.leads WHERE partner_id = ANY($1)`, [partnerIds]);
  await pg.query(`DELETE FROM public.prospect_contacts WHERE partner_id = ANY($1)`, [partnerIds]);
  await pg.query(`DELETE FROM public.consent_events WHERE user_id = ANY($1)`, [userIds]).catch(() => {});
  await pg.query(`DELETE FROM public.legal_acceptances WHERE user_id = ANY($1)`, [userIds]).catch(() => {});
  await pg.query(`DELETE FROM public.user_legal_profiles WHERE user_id = ANY($1)`, [userIds]);
  await pg.query(`DELETE FROM public.audit_logs WHERE actor_id = ANY($1)`, [partnerIds]).catch(() => {});
  await pg.query(`DELETE FROM public.profiles WHERE id = ANY($1)`, [partnerIds]);

  const admin = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  for (const uid of userIds) {
    const { error } = await admin.auth.admin.deleteUser(uid);
    if (error) console.error("auth delete warning", uid, error.message);
  }

  console.log("AUDIT_CLEANUP_DELETED", { profiles: partnerIds.length, authUsers: userIds.length });
  await pg.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
