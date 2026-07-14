import { requireRole } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PartnerApplicationsClient } from "@/components/admin/partner-applications-client";
import type { PartnerType, UserStatus } from "@/lib/types";

export default async function PartnerApplicationsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: profiles }, { data: managers }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, user_id, full_name, email, telegram, status, partner_type, agency_name, website_url, commission_percent_override, assigned_manager_id, partnership_notes, rejection_reason, created_at"
      )
      .eq("role", "partner")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "manager")
      .eq("status", "active")
      .order("full_name"),
  ]);

  const rows = (profiles ?? []).map((profile) => ({
    id: profile.id as string,
    userId: profile.user_id as string,
    fullName: (profile.full_name as string | null) ?? null,
    email: (profile.email as string | null) ?? null,
    telegram: (profile.telegram as string | null) ?? null,
    status: profile.status as UserStatus,
    partnerType: (profile.partner_type as PartnerType | null) ?? null,
    agencyName: (profile.agency_name as string | null) ?? null,
    websiteUrl: (profile.website_url as string | null) ?? null,
    commissionPercentOverride:
      profile.commission_percent_override != null
        ? Number(profile.commission_percent_override)
        : null,
    assignedManagerId: (profile.assigned_manager_id as string | null) ?? null,
    partnershipNotes: (profile.partnership_notes as string | null) ?? null,
    rejectionReason: (profile.rejection_reason as string | null) ?? null,
    createdAt: profile.created_at as string,
  }));

  return (
    <PartnerApplicationsClient
      initialRows={rows}
      managers={(managers ?? []).map((m) => ({
        id: m.id as string,
        full_name: (m.full_name as string | null) ?? null,
        email: (m.email as string | null) ?? null,
      }))}
    />
  );
}
