import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";

export async function GET() {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const supabase = await createClient();

  const [stats, pendingLeads, newProspects, waitingDeals, pendingPayouts] = await Promise.all([
    supabase.from("partner_dashboard_stats").select("*").maybeSingle(),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("prospect_contacts").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("payment_status", "waiting_payment"),
    supabase.from("payouts").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return NextResponse.json({
    stats: stats.data,
    counts: {
      pendingLeads: pendingLeads.count ?? 0,
      newProspects: newProspects.count ?? 0,
      waitingDeals: waitingDeals.count ?? 0,
      pendingPayouts: pendingPayouts.count ?? 0,
    },
  });
}
