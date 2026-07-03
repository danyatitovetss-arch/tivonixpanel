import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({ comment: z.string().max(2000).optional() });

async function reviewLead(
  id: string,
  patch: Record<string, unknown>,
  action: string,
  userId: string,
  comment: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().single();
  if (error) return apiErrorResponse(error.message, 500);

  await supabase.from("lead_activities").insert({
    lead_id: id,
    user_id: userId,
    action_type: action,
    comment,
  });

  await supabase.rpc("write_audit_log", {
    p_action: action,
    p_entity_type: "lead",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiRole("admin", "manager");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  const comment = parsed.success ? parsed.data.comment ?? "Одобрено" : "Одобрено";

  return reviewLead(
    id,
    { status: "approved", admin_review_status: "approved", admin_review_comment: comment },
    "lead_approved",
    auth.user.profileId,
    comment
  );
}
