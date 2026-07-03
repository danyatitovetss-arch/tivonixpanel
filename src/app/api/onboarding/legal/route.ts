import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { getLegalDocumentByType } from "@/lib/legal-documents-content";
import { legalOnboardingSchema, validateLegalAge, calculateAge } from "@/lib/validation/legal";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const current = auth.user!;

  const body = await request.json();
  const parsed = legalOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const age = calculateAge(data.dateOfBirth);

  const supabase = await createClient();

  if (!validateLegalAge(data.dateOfBirth)) {
    await supabase.from("user_legal_profiles").upsert(
      {
        user_id: current.authId,
        full_name: data.fullName,
        email: data.email,
        telegram: null,
        phone: null,
        city: data.city ?? null,
        country: data.country,
        tax_residence_country: data.country,
        date_of_birth: data.dateOfBirth,
        age,
        partner_legal_status: "individual",
        unp: data.unp ?? null,
        organization_name: data.organizationName ?? null,
        payout_preference: data.payoutPreference ?? null,
        preferred_currency: data.preferredCurrency,
        onboarding_status: "blocked_under_16",
        crm_access: false,
        payout_status: "blocked",
      },
      { onConflict: "user_id" }
    );

    await supabase.from("consent_events").insert({
      user_id: current.authId,
      event_type: "access_blocked",
      metadata: { reason: "under_16", age },
    });

    return NextResponse.json({ blocked: true, reason: "under_16" }, { status: 403 });
  }

  const { data: activeDocs } = await supabase
    .from("legal_documents")
    .select("type, version")
    .eq("status", "active");

  const docTypes = [
    { type: "terms", accepted: data.acceptTerms },
    { type: "privacy", accepted: data.acceptPrivacy },
    { type: "personal_data_consent", accepted: data.acceptPersonalData },
    { type: "partner_agreement", accepted: data.acceptPartnerAgreement },
    { type: "commission_rules", accepted: data.acceptCommissionRules },
    { type: "cookies", accepted: data.acceptCookies },
  ] as const;

  for (const doc of docTypes) {
    if (!doc.accepted) {
      return NextResponse.json({ error: "Примите все условия и документы" }, { status: 400 });
    }
    const active = activeDocs?.find((d) => d.type === doc.type);
    if (!active) continue;

    const staticDoc = getLegalDocumentByType(doc.type);

    await supabase.from("legal_acceptances").insert({
      user_id: current.authId,
      document_type: doc.type,
      document_version: active.version,
      consent_text_snapshot: staticDoc?.title ?? doc.type,
      policy_url: `/legal/${doc.type.replace(/_/g, "-")}`,
      acceptance_method: "checkbox",
    });
  }

  await supabase.from("user_legal_profiles").upsert(
    {
      user_id: current.authId,
      full_name: data.fullName,
      email: data.email,
      telegram: null,
      phone: null,
      city: data.city ?? null,
      country: data.country,
      tax_residence_country: data.country,
      date_of_birth: data.dateOfBirth,
      age,
      partner_legal_status: "individual",
      unp: data.unp ?? null,
      organization_name: data.organizationName ?? null,
      payout_preference: data.payoutPreference ?? null,
      preferred_currency: data.preferredCurrency,
      onboarding_status: "completed",
      crm_access: true,
      payout_status: "pending_admin_review",
    },
    { onConflict: "user_id" }
  );

  await supabase.from("profiles").update({
    full_name: data.fullName,
    email: data.email,
    telegram: null,
    phone: null,
  }).eq("user_id", current.authId);

  await supabase.from("consent_events").insert({
    user_id: current.authId,
    event_type: "onboarding_completed",
    metadata: { age },
  });

  await supabase.rpc("write_audit_log", {
    p_action: "legal_onboarding_completed",
    p_entity_type: "user_legal_profile",
    p_entity_id: null,
  });

  return NextResponse.json({ success: true, crmAccess: true });
}
