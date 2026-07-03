import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess, requireApiRole } from "@/lib/auth/require-api-user";
import { dealCreateSchema } from "@/lib/validation/deals";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const user = auth.user;
  const body = await request.json();
  const parsed = dealCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("partner_id")
    .eq("id", parsed.data.leadId)
    .single();

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data: calc } = await supabase.rpc("calculate_commission", {
    p_amount: parsed.data.amount,
    p_partner_id: lead.partner_id,
  });

  const commission = Array.isArray(calc) ? calc[0] : calc;

  const { data, error } = await supabase
    .from("deals")
    .insert({
      lead_id: parsed.data.leadId,
      partner_id: lead.partner_id,
      client_name: parsed.data.clientName,
      service_type: parsed.data.serviceType,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      commission_percent: commission?.total_percent ?? 10,
      commission_amount: commission?.commission_amount ?? 0,
      partner_closed_deals_count_at_moment: commission?.closed_deals_count ?? 0,
      bonus_applied: commission?.bonus_applied ?? false,
      payment_status: "waiting_payment",
      commission_status: "not_accrued",
      notes: parsed.data.notes,
      created_by: user.profileId,
      closed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "deal_created",
    p_entity_type: "deal",
    p_entity_id: data.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}
