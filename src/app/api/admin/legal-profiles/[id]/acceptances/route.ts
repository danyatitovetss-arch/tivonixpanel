import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_acceptances")
    .select("*")
    .eq("user_id", id)
    .order("accepted_at", { ascending: false });
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}
