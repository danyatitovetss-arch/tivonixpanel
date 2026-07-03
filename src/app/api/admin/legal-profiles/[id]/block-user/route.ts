import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", id).single();

  const [{ error: legalErr }, { error: profileErr }] = await Promise.all([
    supabase
      .from("user_legal_profiles")
      .update({ crm_access: false, onboarding_status: "blocked", payout_status: "blocked" })
      .eq("user_id", id),
    profile
      ? supabase.from("profiles").update({ status: "blocked" }).eq("user_id", id)
      : Promise.resolve({ error: null }),
  ]);

  if (legalErr || profileErr) {
    return NextResponse.json({ error: legalErr?.message ?? profileErr?.message }, { status: 500 });
  }

  await supabase.rpc("write_audit_log", {
    p_action: "user_blocked",
    p_entity_type: "profile",
    p_entity_id: profile?.id ?? null,
  });

  return NextResponse.json({ success: true });
}
