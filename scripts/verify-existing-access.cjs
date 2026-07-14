/**
 * Read-only access sanity for existing admin + legacy partner.
 * Does not create/delete users.
 */
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: admins } = await pg.query(
    `SELECT id, user_id, email, status FROM public.profiles WHERE role='admin' AND status='active'`
  );
  console.log("admin_active", admins);

  const { rows: partners } = await pg.query(
    `SELECT id, user_id, email, status, partner_type
     FROM public.profiles
     WHERE role='partner' AND status='active'
     ORDER BY created_at
     LIMIT 3`
  );
  console.log("sample_active_partners", partners);

  // RLS helper: is_partner should be true only for active partners in JWT context;
  // here we check data access via service role counts for partner-owned leads
  if (partners[0]) {
    const { rows: leads } = await pg.query(
      `SELECT count(*)::int AS cnt FROM public.leads WHERE partner_id=$1`,
      [partners[0].id]
    );
    console.log("legacy_partner_leads_visible_count", {
      partnerId: partners[0].id,
      email: partners[0].email,
      leads: leads[0].cnt,
      partner_type: partners[0].partner_type,
    });
  }

  // Ensure null partner_type not treated as error in app mapping
  const nullTypes = await pg.query(
    `SELECT count(*)::int AS cnt FROM public.profiles
     WHERE role='partner' AND status='active' AND partner_type IS NULL`
  );
  console.log("active_partners_null_type_ok", nullTypes.rows[0].cnt);

  // Admin list apps query shape
  const { data: apps, error } = await admin
    .from("profiles")
    .select("id, email, status, partner_type, role")
    .eq("role", "partner")
    .order("created_at", { ascending: false })
    .limit(5);
  console.log("admin_can_query_partners", !error, apps?.length, error?.message);

  await pg.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
