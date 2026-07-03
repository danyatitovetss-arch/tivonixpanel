import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireApiRole("admin", "partner");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("payouts").select("*").eq("id", id).single();
  if (error) return apiErrorResponse(error.message, 404);
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (body.adminComment !== undefined) patch.admin_comment = body.adminComment;
  if (body.paymentMethod) patch.payment_method = body.paymentMethod;
  if (body.paymentDetails) patch.payment_details = body.paymentDetails;

  const supabase = await createClient();
  const { data, error } = await supabase.from("payouts").update(patch).eq("id", id).select().single();
  if (error) return apiErrorResponse(error.message, 500);
  return NextResponse.json({ data });
}
