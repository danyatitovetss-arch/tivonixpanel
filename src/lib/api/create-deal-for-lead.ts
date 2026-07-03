import type { SupabaseClient } from "@supabase/supabase-js";

type LeadRow = {
  id: string;
  partner_id: string;
  business_name: string;
  service_type: string | null;
  estimated_budget: number | null;
  notes: string | null;
};

export async function createDealForLeadIfMissing(
  supabase: SupabaseClient,
  lead: LeadRow,
  createdBy: string
): Promise<{ created: boolean; dealId?: string; error?: string }> {
  const { data: existing } = await supabase
    .from("deals")
    .select("id")
    .eq("lead_id", lead.id)
    .maybeSingle();

  if (existing) return { created: false, dealId: existing.id };

  const amount = Math.max(Number(lead.estimated_budget) || 0, 1);

  const { data: calc } = await supabase.rpc("calculate_commission", {
    p_amount: amount,
    p_partner_id: lead.partner_id,
  });

  const commission = Array.isArray(calc) ? calc[0] : calc;

  const { data, error } = await supabase
    .from("deals")
    .insert({
      lead_id: lead.id,
      partner_id: lead.partner_id,
      client_name: lead.business_name,
      service_type: lead.service_type,
      amount,
      currency: "USD",
      commission_percent: commission?.total_percent ?? 10,
      commission_amount: commission?.commission_amount ?? 0,
      partner_closed_deals_count_at_moment: commission?.closed_deals_count ?? 0,
      bonus_applied: commission?.bonus_applied ?? false,
      payment_status: "waiting_payment",
      commission_status: "not_accrued",
      notes: lead.notes,
      created_by: createdBy,
      closed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { created: false, error: error.message };

  await supabase.rpc("write_audit_log", {
    p_action: "deal_created",
    p_entity_type: "deal",
    p_entity_id: data.id,
  });

  return { created: true, dealId: data.id };
}
