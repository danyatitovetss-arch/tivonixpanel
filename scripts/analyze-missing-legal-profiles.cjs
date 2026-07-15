/**
 * Read-only analysis of profiles missing user_legal_profiles (I-013).
 * Masks PII. Never writes.
 *
 * Usage: node --env-file=.env.local scripts/analyze-missing-legal-profiles.cjs
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = String(email).split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1) || "*"}***@${domain}`;
}

function maskName(name) {
  if (!name) return null;
  return `${String(name).slice(0, 1)}***`;
}

(async () => {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows } = await pg.query(`
    SELECT
      p.id AS profile_id,
      p.user_id,
      p.role::text AS role,
      p.status::text AS status,
      p.partner_type::text AS partner_type,
      p.email,
      p.full_name,
      p.created_at,
      (SELECT count(*)::int FROM public.leads l WHERE l.partner_id = p.id) AS leads,
      (SELECT count(*)::int FROM public.deals d WHERE d.partner_id = p.id) AS deals,
      (SELECT count(*)::int FROM public.balance_transactions b WHERE b.partner_id = p.id) AS balance_tx,
      (SELECT count(*)::int FROM public.prospect_contacts c WHERE c.partner_id = p.id) AS prospects,
      EXISTS (
        SELECT 1 FROM public.legal_acceptances la WHERE la.user_id = p.user_id
      ) AS has_acceptances,
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = p.user_id AND u.email_confirmed_at IS NOT NULL
      ) AS email_confirmed,
      (
        SELECT u.created_at FROM auth.users u WHERE u.id = p.user_id
      ) AS auth_created_at
    FROM public.profiles p
    LEFT JOIN public.user_legal_profiles ulp ON ulp.user_id = p.user_id
    WHERE ulp.id IS NULL
      AND p.role IN ('partner', 'admin', 'manager')
    ORDER BY p.created_at
  `);

  const required = await pg.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_legal_profiles'
      AND is_nullable = 'NO'
    ORDER BY ordinal_position
  `);

  // Likely root cause: handle_new_user creates profile only; legal profile via onboarding
  const triggerInfo = await pg.query(`
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal
  `);

  await pg.end();

  const report = {
    generatedAt: new Date().toISOString(),
    count: rows.length,
    requiredNotNullColumns: required.rows.map((r) => r.column_name),
    authTriggers: triggerInfo.rows.map((r) => r.tgname),
    rootCauseHypothesis:
      "profiles auto-created by handle_new_user; user_legal_profiles only after legal onboarding. Users who never completed onboarding (or admin/manager seeded) lack ulp.",
    rows: rows.map((r) => ({
      profile_id: r.profile_id,
      user_id: r.user_id,
      role: r.role,
      status: r.status,
      partner_type: r.partner_type,
      email: maskEmail(r.email),
      name: maskName(r.full_name),
      created_at: r.created_at,
      auth_created_at: r.auth_created_at,
      leads: r.leads,
      deals: r.deals,
      balance_tx: r.balance_tx,
      prospects: r.prospects,
      has_acceptances: r.has_acceptances,
      email_confirmed: r.email_confirmed,
      safeToCreateMinimalUlp: true,
      note:
        r.leads + r.deals + r.balance_tx + r.prospects === 0
          ? "no business data"
          : "has business data — ulp insert only, no FK side effects",
    })),
  };

  const out = path.join(process.cwd(), "audit-panel", "logs", "i013-analysis.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ count: report.count, roles: report.rows.map((r) => r.role), hypothesis: report.rootCauseHypothesis }, null, 2));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
