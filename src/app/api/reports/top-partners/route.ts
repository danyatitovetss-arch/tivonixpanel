import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

export async function GET() {
  const auth = await requireApiRole("admin", "manager");
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("top_partners").select("*");
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}
