/**
 * Logical snapshot backup of critical TIVONIX tables (no schema reset).
 * Usage: node --env-file=.env.local scripts/create-backup-snapshot.cjs [outDir] [stamp]
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const outDir = process.argv[2] || path.join(process.cwd(), "backups");
const stamp = process.argv[3] || new Date().toISOString().replace(/[:.]/g, "-");

const TABLES = [
  "profiles",
  "user_legal_profiles",
  "legal_documents",
  "legal_acceptances",
  "consent_events",
  "leads",
  "lead_activities",
  "deals",
  "payouts",
  "balance_transactions",
  "commission_settings",
  "prospect_contacts",
  "prospect_activities",
  "audit_logs",
  "rate_limit_buckets",
];

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number" || typeof val === "bigint") return String(val);
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const sqlPath = path.join(outDir, `tivonix-snapshot-${stamp}.sql`);
  const metaPath = path.join(outDir, `tivonix-snapshot-${stamp}.meta.json`);
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const lines = [];
  lines.push("-- TIVONIX logical snapshot (data only)");
  lines.push(`-- created_at: ${new Date().toISOString()}`);
  lines.push("-- NOTE: restore manually / selectively; do NOT run blindly on production");
  lines.push("BEGIN;");

  const counts = {};

  for (const table of TABLES) {
    try {
      const { rows } = await pg.query(`SELECT * FROM public.${table}`);
      counts[table] = rows.length;
      lines.push(`-- TABLE public.${table} (${rows.length} rows)`);
      if (!rows.length) continue;
      const cols = Object.keys(rows[0]);
      for (const row of rows) {
        const values = cols.map((c) => esc(row[c])).join(", ");
        lines.push(
          `INSERT INTO public.${table} (${cols.join(", ")}) VALUES (${values});`
        );
      }
    } catch (e) {
      counts[table] = `ERR: ${e.message}`;
      lines.push(`-- SKIP ${table}: ${e.message}`);
    }
  }

  // auth users metadata only (no hashes dumped as freeform for safety note)
  let authCount = 0;
  try {
    const { rows } = await pg.query(
      `SELECT id, email, created_at, email_confirmed_at, banned_until, raw_user_meta_data
       FROM auth.users ORDER BY created_at`
    );
    authCount = rows.length;
    lines.push(`-- AUTH USERS metadata (${rows.length}) — restore via Admin API if needed`);
    fs.writeFileSync(
      path.join(outDir, `tivonix-auth-users-meta-${stamp}.json`),
      JSON.stringify(rows, null, 2)
    );
  } catch (e) {
    lines.push(`-- AUTH USERS skip: ${e.message}`);
  }

  lines.push("COMMIT;");
  fs.writeFileSync(sqlPath, lines.join("\n"), "utf8");

  const markers = await pg.query(`
    SELECT
      EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='user_status' AND e.enumlabel='pending') AS has_pending,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='partner_type') AS has_partner_type,
      EXISTS (SELECT 1 FROM pg_proc WHERE proname='check_rate_limit') AS has_rate_limit
  `);

  const meta = {
    createdAt: new Date().toISOString(),
    sqlPath,
    authMetaPath: path.join(outDir, `tivonix-auth-users-meta-${stamp}.json`),
    rowCounts: counts,
    authUsers: authCount,
    migrationMarkers: markers.rows[0],
    note: "Logical INSERT snapshot. Prefer pg_dump for full restore capability.",
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log("BACKUP_OK", JSON.stringify(meta, null, 2));
  await pg.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
