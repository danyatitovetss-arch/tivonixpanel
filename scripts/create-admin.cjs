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

const email = process.argv[2] || process.env.ADMIN_EMAIL || "danila.titovets@gmail.com";
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!password) {
  console.error("FAIL: provide password as 2nd arg or ADMIN_PASSWORD env");
  process.exit(1);
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("FAIL: missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  let userId;

  const { data: listed, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    console.error("FAIL: list users", listErr.message);
    process.exit(1);
  }

  const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    userId = existing.id;
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updErr) {
      console.error("FAIL: update user", updErr.message);
      process.exit(1);
    }
    console.log("User exists, password updated");
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Danila Titovets" },
    });
    if (createErr || !created.user) {
      console.error("FAIL: create user", createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log("User created");
  }

  await new Promise((r) => setTimeout(r, 500));

  const { error: promoteErr } = await admin.rpc("promote_admin_by_email", { p_email: email });
  if (promoteErr) {
    const { error: roleErr } = await admin
      .from("profiles")
      .update({ role: "admin", full_name: "Danila Titovets", email })
      .eq("user_id", userId);
    if (roleErr) {
      console.error("FAIL: promote", promoteErr.message, roleErr.message);
      process.exit(1);
    }
  }

  const { error: legalErr } = await admin.from("user_legal_profiles").upsert(
    {
      user_id: userId,
      full_name: "Danila Titovets",
      email,
      country: "Belarus",
      tax_residence_country: "Belarus",
      date_of_birth: "1990-01-01",
      age: 35,
      partner_legal_status: "individual",
      preferred_currency: "USD",
      onboarding_status: "completed",
      crm_access: true,
      payout_status: "approved",
    },
    { onConflict: "user_id" }
  );

  if (legalErr) {
    console.error("FAIL: legal profile", legalErr.message);
    process.exit(1);
  }

  console.log("SUCCESS: admin ready for", email.replace(/(.{2}).+(@.*)/, "$1***$2"));
})();
