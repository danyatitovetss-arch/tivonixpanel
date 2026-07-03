const { Client } = require("pg");
const pass = process.env.DB_PASS;
const ref = "codwkylxpjlinutohflx";
const regions = [
  "eu-west-1", "eu-west-2", "eu-central-1", "eu-north-1",
  "us-east-1", "us-west-1", "ap-southeast-1", "ap-northeast-1",
  "sa-east-1", "ca-central-1",
];

(async () => {
  for (const region of regions) {
    for (const port of [5432, 6543]) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      const url = `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;
      const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 });
      try {
        await c.connect();
        console.log("OK", region, port);
        await c.end();
        process.exit(0);
      } catch (e) {
        const msg = e.message || "";
        if (!msg.includes("ENOTFOUND") && !msg.includes("tenant/user")) {
          console.log("?", region, port, msg.split("\n")[0].slice(0, 60));
        }
        try { await c.end(); } catch {}
      }
    }
  }
  console.log("no pooler found");
})();
