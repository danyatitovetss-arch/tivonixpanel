import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  onboardingStatus: z.string().optional(),
  crmAccess: z.boolean().optional(),
  payoutStatus: z.string().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.onboardingStatus) patch.onboarding_status = parsed.data.onboardingStatus;
  if (parsed.data.crmAccess !== undefined) patch.crm_access = parsed.data.crmAccess;
  if (parsed.data.payoutStatus) patch.payout_status = parsed.data.payoutStatus;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_legal_profiles")
    .update(patch)
    .eq("user_id", id)
    .select()
    .single();

  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "legal_profile_updated",
    p_entity_type: "user_legal_profile",
    p_entity_id: id,
  });

  return NextResponse.json({ data });
}
