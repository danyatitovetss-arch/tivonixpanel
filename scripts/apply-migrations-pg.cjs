/**
 * Apply supabase/apply_all_migrations.sql via direct Postgres connection.
 * Requires DATABASE_URL in .env.local (never commit).
 * Usage: node --env-file=.env.local scripts/apply-migrations-pg.cjs
 */
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { Client } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: DATABASE_URL is not set in .env.local");
  console.error("Get it from Supabase Dashboard → Project Settings → Database → Connection string (URI)");
  process.exit(1);
}

const sql = readFileSync(resolve("supabase/apply_all_migrations.sql"), "utf8");
const chunks = sql.split(/(?=-- ========== )/).map((c) => c.trim()).filter((c) => c.length > 10);

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Postgres");

    let applied = 0;
    for (const chunk of chunks) {
      const nameMatch = chunk.match(/-- ========== (.+?) ==========/);
      const name = nameMatch ? nameMatch[1] : `chunk_${applied}`;
      process.stdout.write(`Applying ${name}... `);
      await client.query(chunk);
      applied++;
      console.log("OK");
    }

    const verify = await client.query(`
      select count(*)::int as tables
      from pg_tables where schemaname = 'public' and tablename = 'profiles'
    `);
    console.log(`SUCCESS: ${applied} chunks applied. profiles table exists: ${verify.rows[0]?.tables === 1}`);
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
})();
