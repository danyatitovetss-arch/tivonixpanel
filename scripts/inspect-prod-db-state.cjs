const { Client } = require("pg");

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const q1 = await c.query(`
    SELECT id, user_id, email, full_name, role, status, partner_type, created_at
    FROM public.profiles
    WHERE email ILIKE '%smoke%'
       OR email ILIKE '%dbsmoke%'
       OR full_name ILIKE '%DB Smoke%'
    ORDER BY created_at DESC
    LIMIT 50
  `);
  console.log("profiles smoke-like", JSON.stringify(q1.rows, null, 2));

  const q2 = await c.query(`
    SELECT id, email, created_at
    FROM auth.users
    WHERE email ILIKE '%smoke%' OR email ILIKE '%dbsmoke%'
    ORDER BY created_at DESC
    LIMIT 50
  `);
  console.log("auth smoke-like", JSON.stringify(q2.rows, null, 2));

  try {
    const q3 = await c.query(`
      SELECT bucket_key, window_start, request_count
      FROM public.rate_limit_buckets
      WHERE bucket_key LIKE 'smoke:%'
         OR bucket_key LIKE 'register:%smoke%'
      ORDER BY window_start DESC
      LIMIT 30
    `);
    console.log("rate buckets", JSON.stringify(q3.rows, null, 2));
  } catch (e) {
    console.log("rate buckets err", e.message);
  }

  const tables = await c.query(`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE tablename ILIKE '%migration%'
  `);
  console.log("migration tables", tables.rows);

  for (const candidate of [
    "supabase_migrations.schema_migrations",
    "supabase_migrations.schema_migrations_history",
  ]) {
    try {
      const m = await c.query(`SELECT * FROM ${candidate} ORDER BY 1`);
      const hit = m.rows.filter((r) =>
        JSON.stringify(r).includes("20260714")
      );
      console.log(candidate, "total", m.rows.length, "hit20260714", hit);
    } catch (e) {
      console.log(candidate, e.message);
    }
  }

  // Functional proof of migrations without re-applying
  const markers = await c.query(`
    SELECT
      (SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
         FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_status') AS user_status_values,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='profiles' AND column_name='partner_type'
      ) AS has_partner_type,
      EXISTS (SELECT 1 FROM pg_proc WHERE proname='check_rate_limit') AS has_rate_limit,
      EXISTS (SELECT 1 FROM pg_proc WHERE proname='protect_privileged_profile_fields') AS has_protect,
      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rate_limit_buckets') AS has_rl_table
  `);
  console.log("markers", JSON.stringify(markers.rows[0], null, 2));

  const partners = await c.query(`
    SELECT
      count(*) FILTER (WHERE status='active') AS active,
      count(*) FILTER (WHERE status='active' AND partner_type IS NULL) AS active_null_type,
      count(*) FILTER (WHERE status='pending') AS pending,
      count(*) FILTER (WHERE partner_type='referral') AS referral,
      count(*) FILTER (WHERE partner_type='white_label') AS white_label
    FROM public.profiles
    WHERE role='partner'
  `);
  console.log("partner stats", partners.rows[0]);

  const admins = await c.query(`
    SELECT id, email, status, role FROM public.profiles WHERE role='admin'
  `);
  console.log("admins", admins.rows);

  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
