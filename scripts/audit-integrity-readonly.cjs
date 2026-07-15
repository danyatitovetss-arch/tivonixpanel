/**
 * Read-only integrity audit of real production data.
 * Masks emails/phones. Never writes. Never prints secrets.
 *
 * Usage: node --env-file=.env.local scripts/audit-integrity-readonly.cjs
 * Output JSON → stdout; also writes audit-panel/logs/integrity-raw.json (masked)
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function maskEmail(email) {
  if (!email || typeof email !== "string") return null;
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const keep = local.slice(0, 1) || "*";
  return `${keep}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `+***${digits.slice(-3)}`;
}

function check(id, status, count, description, sql, remediation) {
  return { id, status, count, description, sql, remediation };
}

(async () => {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const checks = [];

  const users = await pg.query(`SELECT count(*)::int AS n FROM auth.users`);
  const profiles = await pg.query(`SELECT count(*)::int AS n FROM public.profiles`);
  checks.push(
    check(
      "I-001",
      "PASS",
      users.rows[0].n,
      `auth.users count=${users.rows[0].n}; profiles count=${profiles.rows[0].n}`,
      "SELECT count(*) FROM auth.users; SELECT count(*) FROM public.profiles;",
      null
    )
  );

  const byRole = await pg.query(`
    SELECT role::text AS role, count(*)::int AS n
    FROM public.profiles GROUP BY role ORDER BY role
  `);
  checks.push(
    check(
      "I-002",
      "PASS",
      byRole.rows.reduce((a, r) => a + r.n, 0),
      `roles: ${byRole.rows.map((r) => `${r.role}=${r.n}`).join(", ")}`,
      "SELECT role, count(*) FROM profiles GROUP BY role",
      null
    )
  );

  const partners = await pg.query(`
    SELECT count(*)::int AS n FROM public.profiles WHERE role='partner'
  `);
  checks.push(
    check("I-003", "PASS", partners.rows[0].n, `partner profiles=${partners.rows[0].n}`, "SELECT count(*) FROM profiles WHERE role='partner'", null)
  );

  const authNoProfile = await pg.query(`
    SELECT count(*)::int AS n
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.id IS NULL
  `);
  checks.push(
    check(
      "I-004",
      authNoProfile.rows[0].n === 0 ? "PASS" : "FAIL",
      authNoProfile.rows[0].n,
      "auth users without profile",
      "auth.users LEFT JOIN profiles WHERE profiles IS NULL",
      "Create missing profiles or remove orphan auth users after review"
    )
  );

  const profileNoAuth = await pg.query(`
    SELECT count(*)::int AS n
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE u.id IS NULL
  `);
  checks.push(
    check(
      "I-005",
      profileNoAuth.rows[0].n === 0 ? "PASS" : "FAIL",
      profileNoAuth.rows[0].n,
      "profiles without auth.users",
      "profiles LEFT JOIN auth.users WHERE auth missing",
      "Repair or archive orphan profiles"
    )
  );

  // No partner_id on profiles; business tables partner_id null?
  const leadsNullPartner = await pg.query(`SELECT count(*)::int AS n FROM public.leads WHERE partner_id IS NULL`);
  const dealsNullPartner = await pg.query(`SELECT count(*)::int AS n FROM public.deals WHERE partner_id IS NULL`);
  const btNullPartner = await pg.query(`SELECT count(*)::int AS n FROM public.balance_transactions WHERE partner_id IS NULL`);
  const nullCnt = leadsNullPartner.rows[0].n + dealsNullPartner.rows[0].n + btNullPartner.rows[0].n;
  checks.push(
    check(
      "I-006",
      nullCnt === 0 ? "PASS" : "FAIL",
      nullCnt,
      `null partner_id: leads=${leadsNullPartner.rows[0].n} deals=${dealsNullPartner.rows[0].n} balance_tx=${btNullPartner.rows[0].n}`,
      "COUNT rows with partner_id IS NULL",
      "Backfill partner_id or delete orphan business rows after review"
    )
  );

  const dupEmails = await pg.query(`
    SELECT lower(email) AS e, count(*)::int AS n
    FROM public.profiles
    GROUP BY lower(email) HAVING count(*) > 1
  `);
  checks.push(
    check(
      "I-007",
      dupEmails.rows.length === 0 ? "PASS" : "FAIL",
      dupEmails.rows.length,
      `duplicate profile emails (masked groups)=${dupEmails.rows.length}`,
      "GROUP BY lower(email) HAVING count(*)>1",
      "Merge or deactivate duplicates"
    )
  );

  const dupProfiles = await pg.query(`
    SELECT user_id, count(*)::int AS n FROM public.profiles GROUP BY user_id HAVING count(*)>1
  `);
  checks.push(
    check(
      "I-008",
      dupProfiles.rows.length === 0 ? "PASS" : "FAIL",
      dupProfiles.rows.length,
      "duplicate profiles per user_id",
      "GROUP BY user_id HAVING count(*)>1",
      "Keep one profile per user_id"
    )
  );

  const missingEmail = await pg.query(`
    SELECT count(*)::int AS n FROM public.profiles WHERE email IS NULL OR btrim(email)=''
  `);
  checks.push(
    check(
      "I-009",
      missingEmail.rows[0].n === 0 ? "PASS" : "FAIL",
      missingEmail.rows[0].n,
      "profiles missing email",
      "email IS NULL OR empty",
      "Fill email from auth.users"
    )
  );

  const badStatus = await pg.query(`
    SELECT status::text AS status, count(*)::int AS n
    FROM public.profiles
    GROUP BY status ORDER BY status
  `);
  checks.push(
    check(
      "I-010",
      "PASS",
      badStatus.rows.reduce((a, r) => a + r.n, 0),
      `status distribution: ${badStatus.rows.map((r) => `${r.status}=${r.n}`).join(", ")}`,
      "GROUP BY status",
      null
    )
  );

  const orphanLeads = await pg.query(`
    SELECT count(*)::int AS n FROM public.leads l
    LEFT JOIN public.profiles p ON p.id = l.partner_id WHERE p.id IS NULL
  `);
  const orphanDeals = await pg.query(`
    SELECT count(*)::int AS n FROM public.deals d
    LEFT JOIN public.profiles p ON p.id = d.partner_id WHERE p.id IS NULL
  `);
  const orphanBt = await pg.query(`
    SELECT count(*)::int AS n FROM public.balance_transactions b
    LEFT JOIN public.profiles p ON p.id = b.partner_id WHERE p.id IS NULL
  `);
  const orphanActs = await pg.query(`
    SELECT count(*)::int AS n FROM public.lead_activities a
    LEFT JOIN public.leads l ON l.id = a.lead_id WHERE l.id IS NULL
  `);
  const orphans = orphanLeads.rows[0].n + orphanDeals.rows[0].n + orphanBt.rows[0].n + orphanActs.rows[0].n;
  checks.push(
    check(
      "I-011",
      orphans === 0 ? "PASS" : "FAIL",
      orphans,
      `orphans: leads=${orphanLeads.rows[0].n} deals=${orphanDeals.rows[0].n} bt=${orphanBt.rows[0].n} activities=${orphanActs.rows[0].n}`,
      "LEFT JOIN owner missing",
      "Repair FK ownership"
    )
  );

  // Users with business data for multiple partners (impossible via own profile; check lead partner mismatches for activities author)
  const multiPartner = await pg.query(`
    WITH owned AS (
      SELECT p.id AS profile_id, count(DISTINCT l.partner_id)::int AS partners
      FROM public.profiles p
      JOIN public.leads l ON l.partner_id = p.id
      WHERE p.role = 'partner'
      GROUP BY p.id
    )
    SELECT count(*)::int AS n FROM owned WHERE partners > 1
  `);
  checks.push(
    check(
      "I-012",
      multiPartner.rows[0].n === 0 ? "PASS" : "FAIL",
      multiPartner.rows[0].n,
      "partners owning leads under >1 partner_id (should be 0 by construction)",
      "count distinct partner_id per owning profile",
      "Investigate if data model broken"
    )
  );

  // Legal profile coverage
  const legalGap = await pg.query(`
    SELECT count(*)::int AS n
    FROM public.profiles p
    LEFT JOIN public.user_legal_profiles ulp ON ulp.user_id = p.user_id
    WHERE ulp.id IS NULL AND p.role IN ('partner','admin','manager')
  `);
  checks.push(
    check(
      "I-013",
      legalGap.rows[0].n === 0 ? "PASS" : "FAIL",
      legalGap.rows[0].n,
      "profiles without user_legal_profiles",
      "profiles LEFT JOIN user_legal_profiles",
      "Create legal profiles via onboarding repair (dry-run first)"
    )
  );

  // RLS enabled on private tables
  const rls = await pg.query(`
    SELECT c.relname AS table, c.relrowsecurity AS rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public'
      AND c.relkind='r'
      AND c.relname IN (
        'profiles','leads','deals','payouts','balance_transactions',
        'prospect_contacts','lead_activities','user_legal_profiles','audit_logs'
      )
    ORDER BY 1
  `);
  const missingRls = rls.rows.filter((r) => !r.rls);
  checks.push(
    check(
      "I-014",
      missingRls.length === 0 ? "PASS" : "FAIL",
      missingRls.length,
      missingRls.length
        ? `RLS disabled: ${missingRls.map((r) => r.table).join(",")}`
        : `RLS enabled on ${rls.rows.length} critical tables`,
      "pg_class.relrowsecurity",
      "ALTER TABLE ... ENABLE ROW LEVEL SECURITY"
    )
  );

  // Partner type null among active partners (legacy OK)
  const nullType = await pg.query(`
    SELECT count(*)::int AS n FROM public.profiles
    WHERE role='partner' AND status='active' AND partner_type IS NULL
  `);
  checks.push(
    check(
      "I-015",
      "PASS",
      nullType.rows[0].n,
      `active partners with null partner_type (legacy OK)=${nullType.rows[0].n}`,
      "partner_type IS NULL",
      "Optional backfill; not blocking"
    )
  );

  // Sample masked roster (no PII dump)
  const roster = await pg.query(`
    SELECT role::text, status::text, partner_type::text,
           email, phone, telegram, created_at
    FROM public.profiles
    ORDER BY created_at
  `);
  const maskedRoster = roster.rows.map((r) => ({
    role: r.role,
    status: r.status,
    partner_type: r.partner_type,
    email: maskEmail(r.email),
    phone: maskPhone(r.phone),
    has_telegram: Boolean(r.telegram),
    created_at: r.created_at,
  }));

  // Business volume summary
  const biz = await pg.query(`
    SELECT
      (SELECT count(*)::int FROM public.leads) AS leads,
      (SELECT count(*)::int FROM public.deals) AS deals,
      (SELECT count(*)::int FROM public.payouts) AS payouts,
      (SELECT count(*)::int FROM public.balance_transactions) AS balance_tx,
      (SELECT count(*)::int FROM public.prospect_contacts) AS prospects
  `);

  await pg.end();

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "read-only",
    summary: {
      authUsers: users.rows[0].n,
      profiles: profiles.rows[0].n,
      partners: partners.rows[0].n,
      failCount: checks.filter((c) => c.status === "FAIL").length,
      passCount: checks.filter((c) => c.status === "PASS").length,
      business: biz.rows[0],
    },
    checks,
    maskedRoster,
  };

  const outDir = path.join(process.cwd(), "audit-panel", "logs");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "integrity-raw.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: true, summary: report.summary, fail: report.checks.filter((c) => c.status === "FAIL") }, null, 2));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
