import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("mark_deal_as_paid", { p_deal_id: id });

  if (error) {
    return apiErrorResponse(error.message, 500);
  }

  await supabase.rpc("write_audit_log", {
    p_action: "deal_marked_paid",
    p_entity_type: "deal",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
