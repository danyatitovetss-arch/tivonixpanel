import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  actionType: z.string().min(1).max(64),
  comment: z.string().max(2000).optional(),
  oldValue: z.string().max(500).optional(),
  newValue: z.string().max(500).optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (leadErr || !lead) {
    return NextResponse.json({ error: "Клиент не найден или нет доступа" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: id,
      user_id: auth.user.profileId,
      action_type: parsed.data.actionType,
      comment: parsed.data.comment ?? "",
      old_value: parsed.data.oldValue ?? "",
      new_value: parsed.data.newValue ?? "",
    })
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data }, { status: 201 });
}
