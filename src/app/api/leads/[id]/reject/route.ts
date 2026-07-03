import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({ comment: z.string().min(1).max(2000) });

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiRole("admin", "manager");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const comment = parsed.data.comment;
  const { data, error } = await supabase
    .from("leads")
    .update({ status: "rejected", admin_review_status: "rejected", admin_review_comment: comment })
    .eq("id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.from("lead_activities").insert({
    lead_id: id,
    user_id: auth.user.profileId,
    action_type: "lead_rejected",
    comment,
  });

  await supabase.rpc("write_audit_log", {
    p_action: "lead_rejected",
    p_entity_type: "lead",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
