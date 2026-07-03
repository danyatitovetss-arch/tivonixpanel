import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { assertPartnerProspectStatus, canManageLeadWorkflow } from "@/lib/api/permissions";
import { prospectContactSchema } from "@/lib/validation/prospecting";
import { mapProspectInput } from "@/lib/db/mappers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("prospect_contacts").select("*").eq("id", id).single();
  if (error) return apiErrorResponse(error.message, 404);
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json();
  const parsed = prospectContactSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const mapped = mapProspectInput(input as Record<string, unknown>);

  if (!canManageLeadWorkflow(auth.user.role) && mapped.status) {
    if (!assertPartnerProspectStatus(String(mapped.status))) {
      return NextResponse.json({ error: "Недопустимый статус контакта" }, { status: 403 });
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospect_contacts")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.from("prospect_activities").insert({
    prospect_id: id,
    user_id: auth.user.profileId,
    action_type: "updated",
    comment: "Контакт обновлён",
  });

  await supabase.rpc("write_audit_log", {
    p_action: "prospect_updated",
    p_entity_type: "prospect_contact",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { error } = await supabase.from("prospect_contacts").delete().eq("id", id);
  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "prospect_deleted",
    p_entity_type: "prospect_contact",
    p_entity_id: id,
  });

  return NextResponse.json({ success: true });
}
