import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("lead_conversion_funnel").select("*");
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}
