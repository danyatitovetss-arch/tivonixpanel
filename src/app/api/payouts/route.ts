import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";
import { payoutCreateSchema } from "@/lib/validation/payouts";

export async function GET() {
  const auth = await requireApiRole("admin", "partner");
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("payouts").select("*").order("created_at", { ascending: false });
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const parsed = payoutCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const input = parsed.data;

  const { data: balanceRow } = await supabase
    .from("partner_balances")
    .select("balance")
    .eq("partner_id", input.partnerId)
    .maybeSingle();

  const balance = Number(balanceRow?.balance ?? 0);
  if (input.amount > balance) {
    return NextResponse.json({ error: "Amount exceeds available balance" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("payouts")
    .insert({
      partner_id: input.partnerId,
      amount: input.amount,
      currency: input.currency,
      payment_method: input.paymentMethod,
      payment_details: input.paymentDetails,
      admin_comment: input.adminComment,
      status: "pending",
      created_by: auth.user.profileId,
    })
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "payout_created",
    p_entity_type: "payout",
    p_entity_id: data.id,
  });

  return NextResponse.json({ data }, { status: 201 });
}
