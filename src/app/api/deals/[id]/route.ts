import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin", "manager", "partner");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("deals").select("*").eq("id", id).single();
  if (error) return apiErrorResponse(error.message, 404);
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (body.clientName) patch.client_name = body.clientName;
  if (body.serviceType) patch.service_type = body.serviceType;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Сумма должна быть больше 0" }, { status: 400 });
    }
    patch.amount = amount;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase.from("deals").select("partner_id").eq("id", id).single();
  if (!existing) return apiErrorResponse("Сделка не найдена", 404);

  if (patch.amount !== undefined) {
    const { data: calc } = await supabase.rpc("calculate_commission", {
      p_amount: patch.amount,
      p_partner_id: existing.partner_id,
    });
    const commission = Array.isArray(calc) ? calc[0] : calc;
    patch.commission_percent = commission?.total_percent ?? 10;
    patch.commission_amount = commission?.commission_amount ?? 0;
    patch.partner_closed_deals_count_at_moment = commission?.closed_deals_count ?? 0;
    patch.bonus_applied = commission?.bonus_applied ?? false;
  }

  const { data, error } = await supabase.from("deals").update(patch).eq("id", id).select().single();
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}
