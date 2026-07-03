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

  const { data, error } = await supabase
    .from("user_legal_profiles")
    .update({ payout_status: "approved" })
    .eq("user_id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "payouts_approved",
    p_entity_type: "user_legal_profile",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
