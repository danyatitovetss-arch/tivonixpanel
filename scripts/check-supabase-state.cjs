const { createClient } = require("@supabase/supabase-js");
const { readFileSync } = require("fs");
const { resolve } = require("path");

function loadEnv(file) {
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] ??= m[2].trim();
    }
  } catch {}
}

loadEnv(resolve("src/server/.env"));
loadEnv(resolve(".env.local"));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
  console.log("auth:", error ? error.message : `users=${data?.users?.length ?? 0}`);

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const openapi = await res.json();
  const paths = Object.keys(openapi.paths ?? {});
  console.log("rest paths count:", paths.length);
  console.log("sample paths:", paths.slice(0, 20).join(", "));
})();
