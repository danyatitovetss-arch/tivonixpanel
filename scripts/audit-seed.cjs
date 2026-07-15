/**
 * Seed isolated audit_* data for Partner A/B isolation tests.
 * Idempotent. Supports --dry-run.
 *
 * Marker: emails @tivonix.audit + full_name/business_name prefix audit_
 * Never touches emails/roles of non-audit users.
 *
 * Required env:
 *   SUPABASE_URL, SUPABASE_SECRET_KEY
 *   AUDIT_ADMIN_EMAIL, AUDIT_ADMIN_PASSWORD
 *   AUDIT_PARTNER_A_EMAIL, AUDIT_PARTNER_A_PASSWORD
 *   AUDIT_PARTNER_B_EMAIL, AUDIT_PARTNER_B_PASSWORD
 *
 * Optional overrides:
 *   AUDIT_NOTIFY_SINK=disabled (default) — skip external notify hooks in notes
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry-run");
const AUDIT_DOMAIN = "tivonix.audit";

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function assertAuditEmail(email) {
  const lower = email.toLowerCase();
  if (!lower.endsWith(`@${AUDIT_DOMAIN}`) && !lower.includes("audit_")) {
    throw new Error(`Refusing non-audit email: ${email.replace(/(.{1}).*(@.*)/, "$1***$2")}`);
  }
}

async function upsertAuthUser(admin, { email, password, fullName }) {
  assertAuditEmail(email);
  const list = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (DRY) {
    console.log(`[dry-run] upsert auth ${email.replace(/(.{1}).*(@.*)/, "$1***$2")} existing=${Boolean(existing)}`);
    return existing?.id || "dry-run-id";
  }
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, is_audit: true },
    });
    return existing.id;
  }
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, is_audit: true },
  });
  if (created.error) throw created.error;
  return created.data.user.id;
}

async function upsertProfile(admin, { userId, email, fullName, role, partnerType }) {
  if (DRY) {
    console.log(`[dry-run] upsert profile role=${role}`);
    return null;
  }
  const { data, error } = await admin
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        full_name: fullName,
        email,
        role,
        status: "active",
        partner_type: partnerType,
        partnership_notes: "is_audit=true; seeded by scripts/audit-seed.cjs; notify=disabled",
      },
      { onConflict: "user_id" }
    )
    .select("id, user_id, role")
    .single();
  if (error) throw error;

  const legalBase = {
    user_id: userId,
    full_name: fullName,
    email,
    country: "Auditland",
    tax_residence_country: "Auditland",
    date_of_birth: "1990-01-01",
    age: 36,
    crm_access: true,
    onboarding_status: "completed",
    payout_status: role === "partner" ? "approved" : "pending_admin_review",
  };

  const { error: legalErr } = await admin.from("user_legal_profiles").upsert(legalBase, {
    onConflict: "user_id",
  });
  if (legalErr) throw legalErr;
  return data;
}

async function ensureLead(admin, { partnerId, suffix, notes }) {
  const businessName = `audit_lead_${suffix}`;
  if (DRY) {
    console.log(`[dry-run] ensure lead ${businessName}`);
    return { id: "dry-run-lead", business_name: businessName };
  }
  const { data: existing } = await admin
    .from("leads")
    .select("id, business_name, partner_id")
    .eq("partner_id", partnerId)
    .eq("business_name", businessName)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await admin
    .from("leads")
    .insert({
      partner_id: partnerId,
      business_name: businessName,
      contact_name: `audit_contact_${suffix}`,
      niche: "audit",
      city: "Audit City",
      email: `audit_${suffix}@${AUDIT_DOMAIN}`,
      phone: "+375000000000",
      source: "other",
      status: "pending_review",
      priority: "medium",
      notes: notes || "is_audit=true; notify=disabled",
      service_type: "website",
      currency: "USD",
    })
    .select("id, business_name, partner_id")
    .single();
  if (error) throw error;
  return data;
}

async function ensureProspect(admin, { partnerId, createdBy, suffix }) {
  const businessName = `audit_prospect_${suffix}`;
  if (DRY) {
    console.log(`[dry-run] ensure prospect ${businessName}`);
    return { id: "dry-run-prospect" };
  }
  const { data: existing } = await admin
    .from("prospect_contacts")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("business_name", businessName)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await admin
    .from("prospect_contacts")
    .insert({
      partner_id: partnerId,
      created_by: createdBy,
      business_name: businessName,
      contact_person: `audit_prospect_contact_${suffix}`,
      niche: "audit",
      city: "Audit City",
      status: "new",
      priority: "medium",
      notes: "is_audit=true; notify=disabled",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function ensureActivity(admin, { leadId, userProfileId, suffix }) {
  if (DRY) {
    console.log(`[dry-run] ensure activity ${suffix}`);
    return;
  }
  const comment = `audit_activity_${suffix}`;
  const { data: existing } = await admin
    .from("lead_activities")
    .select("id")
    .eq("lead_id", leadId)
    .eq("comment", comment)
    .maybeSingle();
  if (existing) return existing;

  const { error } = await admin.from("lead_activities").insert({
    lead_id: leadId,
    user_id: userProfileId,
    action_type: "comment",
    comment,
  });
  if (error) throw error;
}

async function ensureDealAndFinance(admin, { partnerId, leadId, createdBy, suffix }) {
  const clientName = `audit_client_${suffix}`;
  if (DRY) {
    console.log(`[dry-run] ensure deal/finance ${clientName}`);
    return;
  }
  let { data: deal } = await admin
    .from("deals")
    .select("id, payment_status")
    .eq("partner_id", partnerId)
    .eq("client_name", clientName)
    .maybeSingle();

  if (!deal) {
    const inserted = await admin
      .from("deals")
      .insert({
        partner_id: partnerId,
        lead_id: leadId,
        client_name: clientName,
        service_type: "website",
        amount: 1000,
        currency: "USD",
        commission_percent: 10,
        commission_amount: 100,
        payment_status: "waiting_payment",
        commission_status: "not_accrued",
        created_by: createdBy,
        notes: "is_audit=true; notify=disabled",
      })
      .select("id, payment_status")
      .single();
    if (inserted.error) throw inserted.error;
    deal = inserted.data;
  }

  // Accrual row only if not exists (do NOT call mark_deal_as_paid RPC to avoid side effects on real flows)
  const { data: existingTx } = await admin
    .from("balance_transactions")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("deal_id", deal.id)
    .eq("type", "accrual")
    .maybeSingle();

  if (!existingTx) {
    // Keep deal pending — financial isolation tests use pending amounts + partner-scoped reads.
    // Optional synthetic accrual for export tests marked audit
    const { error } = await admin.from("balance_transactions").insert({
      partner_id: partnerId,
      deal_id: deal.id,
      type: "accrual",
      amount: 100,
      currency: "USD",
      status: "completed",
      description: `audit_accrual_${suffix}`,
      created_by: createdBy,
    });
    if (error && !String(error.message).includes("duplicate")) throw error;
  }

  return deal;
}

async function main() {
  const url = requireEnv("SUPABASE_URL");
  const secret = requireEnv("SUPABASE_SECRET_KEY");
  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`audit-seed start dryRun=${DRY} notify=disabled`);

  const specs = [
    {
      key: "admin",
      email: requireEnv("AUDIT_ADMIN_EMAIL"),
      password: requireEnv("AUDIT_ADMIN_PASSWORD"),
      fullName: "audit_admin",
      role: "admin",
      partnerType: null,
    },
    {
      key: "partner_a",
      email: requireEnv("AUDIT_PARTNER_A_EMAIL"),
      password: requireEnv("AUDIT_PARTNER_A_PASSWORD"),
      fullName: "audit_partner_a",
      role: "partner",
      partnerType: "referral",
    },
    {
      key: "partner_b",
      email: requireEnv("AUDIT_PARTNER_B_EMAIL"),
      password: requireEnv("AUDIT_PARTNER_B_PASSWORD"),
      fullName: "audit_partner_b",
      role: "partner",
      partnerType: "referral",
    },
  ];

  const ids = {};
  for (const spec of specs) {
    assertAuditEmail(spec.email);
    const userId = await upsertAuthUser(admin, spec);
    const profile = await upsertProfile(admin, {
      userId,
      email: spec.email,
      fullName: spec.fullName,
      role: spec.role,
      partnerType: spec.partnerType,
    });
    ids[spec.key] = { userId, profileId: profile?.id };
  }

  if (!DRY) {
    // refresh profile ids
    for (const spec of specs) {
      const { data } = await admin.from("profiles").select("id").eq("email", spec.email).single();
      ids[spec.key].profileId = data.id;
    }
  }

  const partnerA = ids.partner_a.profileId;
  const partnerB = ids.partner_b.profileId;
  const adminProfile = ids.admin.profileId;

  const leadA1 = await ensureLead(admin, { partnerId: partnerA, suffix: "a1" });
  const leadA2 = await ensureLead(admin, { partnerId: partnerA, suffix: "a2" });
  const leadB1 = await ensureLead(admin, { partnerId: partnerB, suffix: "b1" });
  const leadB2 = await ensureLead(admin, { partnerId: partnerB, suffix: "b2" });

  await ensureProspect(admin, { partnerId: partnerA, createdBy: partnerA, suffix: "a1" });
  await ensureProspect(admin, { partnerId: partnerA, createdBy: partnerA, suffix: "a2" });
  await ensureProspect(admin, { partnerId: partnerB, createdBy: partnerB, suffix: "b1" });
  await ensureProspect(admin, { partnerId: partnerB, createdBy: partnerB, suffix: "b2" });

  if (!DRY) {
    await ensureActivity(admin, { leadId: leadA1.id, userProfileId: partnerA, suffix: "a1" });
    await ensureActivity(admin, { leadId: leadB1.id, userProfileId: partnerB, suffix: "b1" });
    await ensureDealAndFinance(admin, {
      partnerId: partnerA,
      leadId: leadA1.id,
      createdBy: adminProfile,
      suffix: "a1",
    });
    await ensureDealAndFinance(admin, {
      partnerId: partnerB,
      leadId: leadB1.id,
      createdBy: adminProfile,
      suffix: "b1",
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY,
    domain: AUDIT_DOMAIN,
    ids: DRY
      ? ids
      : {
          adminProfileId: ids.admin.profileId,
          partnerAProfileId: ids.partner_a.profileId,
          partnerBProfileId: ids.partner_b.profileId,
          leadA1Id: leadA1.id,
          leadA2Id: leadA2.id,
          leadB1Id: leadB1.id,
          leadB2Id: leadB2.id,
        },
    note: "Passwords not stored. Notify/Telegram/email hooks disabled via notes marker only — no messages sent by this script.",
  };

  const out = path.join(process.cwd(), "audit-panel", "logs", "audit-seed-manifest.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log("SEED_OK", JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
