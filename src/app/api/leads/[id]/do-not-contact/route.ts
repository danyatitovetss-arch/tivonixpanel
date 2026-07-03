import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin", "manager");
  if (auth.response) return auth.response;
  const { id } = await context.params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status: "do_not_contact", admin_review_status: "do_not_contact" })
    .eq("id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.from("lead_activities").insert({
    lead_id: id,
    user_id: auth.user.profileId,
    action_type: "do_not_contact",
    comment: "Не трогать",
  });

  await supabase.rpc("write_audit_log", {
    p_action: "lead_do_not_contact",
    p_entity_type: "lead",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
