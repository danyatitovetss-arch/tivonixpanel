import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: prospect, error: pErr } = await supabase
    .from("prospect_contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (pErr || !prospect) {
    return NextResponse.json({ error: "Контакт не найден" }, { status: 404 });
  }

  if (auth.user.role === "partner" && prospect.partner_id !== auth.user.profileId) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { data: lead, error: lErr } = await supabase
    .from("leads")
    .insert({
      business_name: prospect.business_name,
      niche: prospect.niche,
      city: prospect.city,
      contact_name: prospect.contact_person,
      instagram_url: prospect.instagram,
      telegram_username: prospect.telegram,
      phone: prospect.phone,
      email: prospect.email,
      website: prospect.website,
      source: prospect.source,
      notes: prospect.notes,
      partner_id: prospect.partner_id,
      status: "pending_review",
      admin_review_status: "pending",
    })
    .select()
    .single();

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  await supabase
    .from("prospect_contacts")
    .update({ status: "converted_to_lead", converted_lead_id: lead.id })
    .eq("id", id);

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    user_id: auth.user.profileId,
    action_type: "lead_created",
    comment: "Создан из prospecting",
  });

  await supabase.from("prospect_activities").insert({
    prospect_id: id,
    user_id: auth.user.profileId,
    action_type: "converted_to_lead",
    comment: `Lead ${lead.id}`,
  });

  await supabase.rpc("write_audit_log", {
    p_action: "prospect_converted_to_lead",
    p_entity_type: "prospect_contact",
    p_entity_id: id,
  });

  return NextResponse.json({ data: lead }, { status: 201 });
}
