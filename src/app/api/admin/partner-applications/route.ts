import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/require-api-user";
import { createClient } from "@/lib/supabase/server";
import { apiErrorResponse } from "@/lib/api/respond";

export async function GET() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, user_id, full_name, email, telegram, role, status, partner_type, agency_name, website_url, commission_percent_override, assigned_manager_id, partnership_notes, rejection_reason, reviewed_at, reviewed_by, created_at"
    )
    .eq("role", "partner")
    .order("created_at", { ascending: false });

  if (error) return apiErrorResponse(error.message, 500);

  const managers = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "manager")
    .eq("status", "active")
    .order("full_name");

  const data = (profiles ?? []).map((profile) => ({
    id: profile.id,
    userId: profile.user_id,
    fullName: profile.full_name,
    email: profile.email,
    telegram: profile.telegram,
    status: profile.status,
    partnerType: profile.partner_type,
    agencyName: profile.agency_name,
    websiteUrl: profile.website_url,
    commissionPercentOverride: profile.commission_percent_override,
    assignedManagerId: profile.assigned_manager_id,
    partnershipNotes: profile.partnership_notes,
    rejectionReason: profile.rejection_reason,
    reviewedAt: profile.reviewed_at,
    reviewedBy: profile.reviewed_by,
    createdAt: profile.created_at,
  }));

  return NextResponse.json({
    data,
    managers: managers.data ?? [],
  });
}
