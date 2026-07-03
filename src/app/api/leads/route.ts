import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { leadCreateSchema } from "@/lib/validation/leads";
import { findDuplicateLeadGlobal } from "@/lib/api/find-duplicate-lead";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const user = auth.user;
  const body = await request.json();
  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const input = parsed.data;

  let dup: unknown[] = [];
  try {
    dup = await findDuplicateLeadGlobal({
      businessName: input.businessName,
      website: input.website,
      instagram: input.instagramUrl,
      telegram: input.telegramUsername,
      phone: input.phone,
      email: input.email || null,
    });
  } catch {
    /* duplicate check optional if admin client unavailable */
  }

  if (dup.length > 0 && user.role === "partner") {
    return NextResponse.json(
      { error: "Duplicate lead", duplicate: dup[0] },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_name: input.businessName,
      niche: input.niche,
      city: input.city,
      contact_name: input.contactName,
      instagram_url: input.instagramUrl,
      telegram_username: input.telegramUsername,
      phone: input.phone,
      email: input.email || null,
      website: input.website,
      source: input.source,
      service_type: input.serviceType,
      estimated_budget: input.estimatedBudget,
      notes: input.notes,
      next_action: input.nextAction,
      partner_id: user.profileId,
      status: "pending_review",
      admin_review_status: "pending",
    })
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "lead_created",
    p_entity_type: "lead",
    p_entity_id: data.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}
