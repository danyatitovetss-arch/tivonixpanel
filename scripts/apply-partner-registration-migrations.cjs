/**
 * Apply only partner-registration migrations (additive).
 * Usage: node --env-file=.env.local scripts/apply-partner-registration-migrations.cjs
 */
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { Client } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: DATABASE_URL is not set");
  process.exit(1);
}

const files = [
  "supabase/migrations/20260714000000_partner_registration_enums.sql",
  "supabase/migrations/20260714000001_partner_self_registration.sql",
  "supabase/migrations/20260714000002_register_rate_limit.sql",
];

async function preflight(client) {
  console.log("=== PREFLIGHT ===");
  const status = await client.query(
    "select status::text as status, count(*)::int as cnt from public.profiles group by status order by cnt desc"
  );
  console.log("statuses:", status.rows);

  const roles = await client.query(
    "select role::text as role, count(*)::int as cnt from public.profiles group by role order by cnt desc"
  );
  console.log("roles:", roles.rows);

  const badAdmins = await client.query(
    "select email, role::text as role, status::text as status from public.profiles where role = 'admin' and status::text is distinct from 'active'"
  );
  console.log("non-active admins:", badAdmins.rows);

  const enums = await client.query(
    `select e.enumlabel
     from pg_enum e
     join pg_type t on t.oid = e.enumtypid
     join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public' and t.typname = 'user_status'
     order by e.enumsortorder`
  );
  console.log(
    "user_status labels:",
    enums.rows.map((r) => r.enumlabel)
  );

  const cols = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles'
       and column_name in (
         'partner_type','agency_name','website_url',
         'commission_percent_override','assigned_manager_id','rejection_reason'
       )
     order by 1`
  );
  console.log(
    "new cols present:",
    cols.rows.map((r) => r.column_name)
  );

  const docs = await client.query(
    `select type::text as type, version, status::text as status
     from public.legal_documents
     where type::text in ('terms','privacy') and status::text = 'active'`
  );
  console.log("active legal docs:", docs.rows);
}

async function verify(client) {
  console.log("=== VERIFY ===");
  const enums = await client.query(
    `select e.enumlabel
     from pg_enum e
     join pg_type t on t.oid = e.enumtypid
     join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public' and t.typname = 'user_status'
     order by e.enumsortorder`
  );
  console.log(
    "user_status:",
    enums.rows.map((r) => r.enumlabel)
  );

  const pt = await client.query(
    `select exists(select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='partner_type') as ok`
  );
  console.log("partner_type enum:", pt.rows[0].ok);

  const cols = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema='public' and table_name='profiles'
       and column_name in (
         'partner_type','agency_name','website_url','commission_percent_override',
         'partnership_notes','assigned_manager_id','reviewed_at','reviewed_by','rejection_reason'
       )
     order by 1`
  );
  console.log(
    "profile columns:",
    cols.rows.map((r) => r.column_name)
  );

  const fn = await client.query(
    `select exists(
       select 1 from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'check_rate_limit'
     ) as ok`
  );
  console.log("check_rate_limit:", fn.rows[0].ok);

  const def = await client.query(
    `select column_default
     from information_schema.columns
     where table_schema='public' and table_name='profiles' and column_name='status'`
  );
  console.log("profiles.status default:", def.rows[0]?.column_default);

  const admins = await client.query(
    `select count(*)::int as cnt from public.profiles where role='admin' and status='active'`
  );
  console.log("active admins:", admins.rows[0].cnt);
}

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Postgres");
    await preflight(client);

    for (const file of files) {
      const sql = readFileSync(resolve(file), "utf8");
      process.stdout.write(`Applying ${file}... `);
      // Enum ADD VALUE cannot reliably share a transaction with later usage.
      // Run each migration file as its own connection unit (auto-commit statements).
      await client.query(sql);
      console.log("OK");
    }

    await verify(client);
    console.log("SUCCESS: partner registration migrations applied");
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
})();
