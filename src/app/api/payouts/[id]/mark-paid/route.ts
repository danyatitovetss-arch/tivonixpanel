import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: payout } = await supabase.from("payouts").select("*").eq("id", id).single();
  if (!payout || payout.status === "paid") {
    return NextResponse.json({ error: "Payout not found or already paid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("payouts")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.from("balance_transactions").insert({
    partner_id: payout.partner_id,
    payout_id: id,
    type: "payout",
    amount: -Math.abs(Number(payout.amount)),
    currency: payout.currency,
    status: "completed",
    description: payout.admin_comment || "Выплата партнёру",
    created_by: auth.user.profileId,
  });

  await supabase.rpc("write_audit_log", {
    p_action: "payout_paid",
    p_entity_type: "payout",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
