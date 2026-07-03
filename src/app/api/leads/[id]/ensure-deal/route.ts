import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";
import { createDealForLeadIfMissing } from "@/lib/api/create-deal-for-lead";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, partner_id, business_name, service_type, estimated_budget, notes, status")
    .eq("id", id)
    .single();

  if (leadErr || !lead) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }

  if (lead.status !== "won") {
    return NextResponse.json({ error: "Сделка создаётся только для закрытых клиентов" }, { status: 400 });
  }

  const result = await createDealForLeadIfMissing(supabase, lead, auth.user.profileId);
  if (result.error) return apiErrorResponse(result.error, 500);

  if (!result.created) {
    return NextResponse.json({ data: { dealId: result.dealId }, created: false });
  }

  const { data: deal } = await supabase.from("deals").select("*").eq("id", result.dealId!).single();
  return NextResponse.json({ data: deal, created: true }, { status: 201 });
}
