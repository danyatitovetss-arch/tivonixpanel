import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();
  const { data, error } = await supabase.from("deals").select("service_type").not("service_type", "is", null);
  if (error) return apiErrorResponse(error.message, 500);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const s = String(row.service_type ?? "other");
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  return NextResponse.json({
    data: [...counts.entries()].map(([serviceType, count]) => ({ serviceType, count })),
  });
}
