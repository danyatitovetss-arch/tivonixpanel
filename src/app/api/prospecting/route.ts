import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { prospectContactSchema } from "@/lib/validation/prospecting";
import { assertPartnerProspectStatus, canManageLeadWorkflow } from "@/lib/api/permissions";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospect_contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return apiErrorResponse(error.message, 500);
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const user = auth.user;
  const body = await request.json();
  const parsed = prospectContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const mapped = mapProspectInput(parsed.data);

  if (!canManageLeadWorkflow(user.role)) {
    const status = parsed.data.status ?? "new";
    if (!assertPartnerProspectStatus(status)) {
      return NextResponse.json({ error: "Недопустимый статус контакта" }, { status: 403 });
    }
    mapped.status = status;
  }

  const { data, error } = await supabase
    .from("prospect_contacts")
    .insert({
      ...mapped,
      partner_id: user.profileId,
      created_by: user.profileId,
    })
    .select()
    .single();

  if (error) {
    return apiErrorResponse(error.message, 500);
  }

  await supabase.rpc("write_audit_log", {
    p_action: "prospect_created",
    p_entity_type: "prospect_contact",
    p_entity_id: data.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}

function mapProspectInput(input: ReturnType<typeof prospectContactSchema.parse>) {
  return {
    business_name: input.businessName,
    niche: input.niche,
    city: input.city,
    source: input.source,
    website: input.website,
    instagram: input.instagram,
    telegram: input.telegram,
    phone: input.phone,
    email: input.email || null,
    contact_person: input.contactPerson,
    status: input.status ?? "new",
    priority: input.priority ?? "medium",
    website_quality: input.websiteQuality ?? "unknown",
    has_website: input.hasWebsite,
    has_online_booking: input.hasOnlineBooking ?? false,
    has_telegram_bot: input.hasTelegramBot ?? false,
    has_crm: input.hasCrm ?? false,
    pain_points: input.painPoints,
    notes: input.notes,
  };
}
