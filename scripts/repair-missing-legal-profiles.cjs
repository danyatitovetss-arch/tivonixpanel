/**
 * Repair missing user_legal_profiles for existing profiles (I-013).
 *
 * Default: --dry-run
 * Apply:   --apply
 *
 * Safety:
 * - Only inserts for profiles that have NO user_legal_profiles row
 * - Never updates existing legal profiles
 * - Never changes role, partner_id, email, user_id
 * - No notifications
 * - Idempotent
 *
 * Usage:
 *   node --env-file=.env.local scripts/repair-missing-legal-profiles.cjs
 *   node --env-file=.env.local scripts/repair-missing-legal-profiles.cjs --apply
 */
const { Client } = require("pg");

const APPLY = process.argv.includes("--apply");
const DRY = !APPLY;

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = String(email).split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1) || "*"}***@${domain}`;
}

(async () => {
  const pg = new Client({
    connectionString: requireEnv("DATABASE_URL"),
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: missing } = await pg.query(`
    SELECT p.id AS profile_id, p.user_id, p.email, p.full_name, p.role::text AS role, p.status::text AS status
    FROM public.profiles p
    LEFT JOIN public.user_legal_profiles ulp ON ulp.user_id = p.user_id
    WHERE ulp.id IS NULL
      AND p.role IN ('partner', 'admin', 'manager')
    ORDER BY p.created_at
  `);

  console.log(
    JSON.stringify(
      {
        mode: DRY ? "dry-run" : "apply",
        found: missing.length,
        targets: missing.map((r) => ({
          profile_id: r.profile_id,
          user_id: r.user_id,
          role: r.role,
          status: r.status,
          email: maskEmail(r.email),
        })),
      },
      null,
      2
    )
  );

  if (missing.length === 0) {
    console.log("Nothing to repair.");
    await pg.end();
    return;
  }

  if (DRY) {
    console.log("Dry-run only. Re-run with --apply to insert minimal legal profiles.");
    console.log("ROLLBACK: DELETE FROM user_legal_profiles WHERE user_id = ANY(ARRAY[<ids>]) AND full_name LIKE ... OR notes — prefer delete by user_id list from this log if mistakenly applied.");
    await pg.end();
    return;
  }

  let created = 0;
  let skipped = 0;

  await pg.query("BEGIN");
  try {
    for (const row of missing) {
      // Double-check still missing inside transaction
      const check = await pg.query(
        `SELECT 1 FROM public.user_legal_profiles WHERE user_id = $1 LIMIT 1`,
        [row.user_id]
      );
      if (check.rowCount > 0) {
        skipped += 1;
        continue;
      }

      const fullName = row.full_name && String(row.full_name).trim() ? row.full_name : "Pending profile";
      const email = row.email && String(row.email).trim() ? row.email : `unknown-${row.user_id}@invalid.local`;

      // Minimal valid row: not_started onboarding, crm_access false — forces resume of legal flow
      // Placeholder DOB 1990-01-01 / age 36 / country XX only to satisfy NOT NULL; user updates in onboarding
      await pg.query(
        `
        INSERT INTO public.user_legal_profiles (
          user_id, full_name, email, country, tax_residence_country,
          date_of_birth, age, partner_legal_status,
          onboarding_status, crm_access, payout_status, preferred_currency
        ) VALUES (
          $1, $2, $3, 'Unknown', 'Unknown',
          DATE '1990-01-01', 36, 'individual',
          'not_started', false, 'pending_admin_review', 'USD'
        )
        ON CONFLICT (user_id) DO NOTHING
        `,
        [row.user_id, fullName, email]
      );
      created += 1;
    }

    await pg.query("COMMIT");
  } catch (e) {
    await pg.query("ROLLBACK");
    throw e;
  }

  const { rows: stillMissing } = await pg.query(`
    SELECT count(*)::int AS n
    FROM public.profiles p
    LEFT JOIN public.user_legal_profiles ulp ON ulp.user_id = p.user_id
    WHERE ulp.id IS NULL AND p.role IN ('partner', 'admin', 'manager')
  `);

  console.log(
    JSON.stringify(
      {
        mode: "apply",
        found: missing.length,
        created,
        skipped,
        remainingMissing: stillMissing[0].n,
        rollback:
          "DELETE FROM public.user_legal_profiles WHERE user_id = ANY($ids::uuid[]) AND onboarding_status = 'not_started' AND country = 'Unknown' AND date_of_birth = '1990-01-01'; — only rows created by this repair.",
      },
      null,
      2
    )
  );

  await pg.end();
  if (stillMissing[0].n !== 0) process.exit(2);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
