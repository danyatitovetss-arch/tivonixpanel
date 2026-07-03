import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

export async function GET() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const supabase = await createClient();

  const { data: profiles, error: pErr } = await supabase
    .from("user_legal_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const authIds = (profiles ?? []).map((p) => p.user_id);
  const { data: authProfiles } = await supabase
    .from("profiles")
    .select("id, user_id, email, full_name, telegram, role, status, created_at")
    .in("user_id", authIds.length ? authIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map((authProfiles ?? []).map((p) => [p.user_id, p]));

  const rows = (profiles ?? []).map((legal) => {
    const profile = profileMap.get(legal.user_id);
    return { ...legal, profile };
  });

  return NextResponse.json({ data: rows });
}
