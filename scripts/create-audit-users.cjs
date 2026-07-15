/**
 * Creates audit users: admin, partner_a, partner_b for isolation testing.
 * Passwords come ONLY from env — never hardcoded.
 *
 * Required env (.env.local):
 *   SUPABASE_URL, SUPABASE_SECRET_KEY
 *   AUDIT_ADMIN_EMAIL, AUDIT_ADMIN_PASSWORD
 *   AUDIT_PARTNER_A_EMAIL, AUDIT_PARTNER_A_PASSWORD
 *   AUDIT_PARTNER_B_EMAIL, AUDIT_PARTNER_B_PASSWORD
 *
 * Run:
 *   npm run audit:users
 */
const { createClient } = require("@supabase/supabase-js");

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function upsertUser(admin, { email, password, fullName, role, partnerType }) {
  const list = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId;
  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password });
    console.log(`Updated auth user: ${email}`);
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (created.error) throw created.error;
    userId = created.data.user.id;
    console.log(`Created auth user: ${email}`);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      user_id: userId,
      full_name: fullName,
      email,
      role,
      status: "active",
      partner_type: partnerType,
    },
    { onConflict: "user_id" }
  );
  if (profileError) throw profileError;

  await admin.from("user_legal_profiles").upsert(
    {
      user_id: userId,
      crm_access: true,
      onboarding_status: "completed",
    },
    { onConflict: "user_id" }
  );

  return userId;
}

async function main() {
  const url = requireEnv("SUPABASE_URL");
  const secret = requireEnv("SUPABASE_SECRET_KEY");
  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const specs = [
    {
      email: requireEnv("AUDIT_ADMIN_EMAIL"),
      password: requireEnv("AUDIT_ADMIN_PASSWORD"),
      fullName: "Audit Admin",
      role: "admin",
      partnerType: null,
    },
    {
      email: requireEnv("AUDIT_PARTNER_A_EMAIL"),
      password: requireEnv("AUDIT_PARTNER_A_PASSWORD"),
      fullName: "Audit Partner A",
      role: "partner",
      partnerType: "referral",
    },
    {
      email: requireEnv("AUDIT_PARTNER_B_EMAIL"),
      password: requireEnv("AUDIT_PARTNER_B_PASSWORD"),
      fullName: "Audit Partner B",
      role: "partner",
      partnerType: "referral",
    },
  ];

  for (const spec of specs) {
    await upsertUser(admin, spec);
  }

  console.log("Audit users ready. Use them for Partner A/B isolation checks.");
  console.log("Do NOT commit passwords. Rotate after QA if shared.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
