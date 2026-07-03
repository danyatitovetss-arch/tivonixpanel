import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess, requireApiRole } from "@/lib/auth/require-api-user";

const patchSchema = z.object({
  basePercentUnder2000: z.number().min(0).max(100).optional(),
  basePercentFrom2000: z.number().min(0).max(100).optional(),
  bonusAfterClosedDeals: z.number().int().min(0).optional(),
  bonusPercent: z.number().min(0).max(100).optional(),
  currency: z.string().max(8).optional(),
});

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("commission_settings").select("*").limit(1).maybeSingle();
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const patch: Record<string, unknown> = {};
  if (input.basePercentUnder2000 !== undefined) patch.base_percent_under_2000 = input.basePercentUnder2000;
  if (input.basePercentFrom2000 !== undefined) patch.base_percent_from_2000 = input.basePercentFrom2000;
  if (input.bonusAfterClosedDeals !== undefined) patch.bonus_after_closed_deals = input.bonusAfterClosedDeals;
  if (input.bonusPercent !== undefined) patch.bonus_percent = input.bonusPercent;
  if (input.currency) patch.currency = input.currency;

  const supabase = await createClient();
  const { data: row } = await supabase.from("commission_settings").select("id").limit(1).maybeSingle();
  if (!row?.id) {
    return NextResponse.json({ error: "Commission settings not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("commission_settings")
    .update(patch)
    .eq("id", row.id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "commission_settings_updated",
    p_entity_type: "commission_settings",
    p_entity_id: row.id,
  });

  return NextResponse.json({ data });
}
