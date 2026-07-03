import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  mapProfile,
  mapLead,
  mapLeadActivity,
  mapDeal,
  mapPayout,
  mapBalanceTransaction,
  mapCommissionSettings,
  mapProspectContact,
  mapProspectActivity,
  mapPartnerProfile,
} from "@/lib/db/mappers";
import type { AppData } from "@/lib/types";
import { getSeedData } from "@/lib/seed-data";

export async function GET() {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
  }

  const supabase = await createClient();

  const [
    profilesRes,
    leadsRes,
    leadActivitiesRes,
    dealsRes,
    payoutsRes,
    balanceRes,
    commissionRes,
    prospectsRes,
    prospectActivitiesRes,
    legalProfilesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("lead_activities").select("*").order("created_at", { ascending: false }),
    supabase.from("deals").select("*").order("created_at", { ascending: false }),
    supabase.from("payouts").select("*").order("created_at", { ascending: false }),
    supabase.from("balance_transactions").select("*").order("created_at", { ascending: false }),
    supabase.from("commission_settings").select("*").limit(1).maybeSingle(),
    supabase.from("prospect_contacts").select("*").order("created_at", { ascending: false }),
    supabase.from("prospect_activities").select("*").order("created_at", { ascending: false }),
    supabase.from("user_legal_profiles").select("*"),
  ]);

  const errors = [
    profilesRes.error,
    leadsRes.error,
    leadActivitiesRes.error,
    dealsRes.error,
    payoutsRes.error,
    balanceRes.error,
    prospectsRes.error,
    prospectActivitiesRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0]!.message }, { status: 500 });
  }

  const users = (profilesRes.data ?? []).map((r) => mapProfile(r as Record<string, unknown>));
  const legalByAuthId = new Map(
    (legalProfilesRes.data ?? []).map((l) => [l.user_id as string, l])
  );

  const profileById = new Map(users.map((u) => [u.id, u]));
  const authProfile = users.find((u) => u.id === current.profileId);

  const partnerProfiles = users.map((u) => {
    const profileRow = (profilesRes.data ?? []).find((p) => p.id === u.id);
    const legal = [...legalByAuthId.values()].find(
      (l) => profileRow && l.email === profileRow.email
    );
    if (legal) {
      return mapPartnerProfile(legal as Record<string, unknown>, u.id);
    }
    return {
      userId: u.id,
      phone: profileRow?.phone ?? "",
      city: "",
      country: "",
      paymentMethod: "",
      paymentDetails: "",
      onboardingCompletedAt: current.onboardingComplete ? new Date().toISOString().slice(0, 10) : "",
    };
  });

  const defaultCommission = getSeedData().commissionSettings;
  const commissionSettings = commissionRes.data
    ? mapCommissionSettings(commissionRes.data as Record<string, unknown>)
    : defaultCommission;

  const data: AppData = {
    users,
    leads: (leadsRes.data ?? []).map((r) => mapLead(r as Record<string, unknown>)),
    leadActivities: (leadActivitiesRes.data ?? []).map((r) =>
      mapLeadActivity(r as Record<string, unknown>)
    ),
    deals: (dealsRes.data ?? []).map((r) => mapDeal(r as Record<string, unknown>)),
    payouts: (payoutsRes.data ?? []).map((r) => mapPayout(r as Record<string, unknown>)),
    balanceTransactions: (balanceRes.data ?? []).map((r) =>
      mapBalanceTransaction(r as Record<string, unknown>)
    ),
    commissionSettings,
    prospectContacts: (prospectsRes.data ?? []).map((r) =>
      mapProspectContact(r as Record<string, unknown>)
    ),
    prospectActivities: (prospectActivitiesRes.data ?? []).map((r) =>
      mapProspectActivity(r as Record<string, unknown>)
    ),
    partnerProfiles,
  };

  const currentUser =
    authProfile ??
    users.find((u) => u.id === current.profileId) ??
    ({
      id: current.profileId,
      name: current.fullName ?? current.email,
      email: current.email,
      telegram: "",
      role: current.role,
      status: current.status,
      createdAt: new Date().toISOString().slice(0, 10),
    } satisfies AppData["users"][0]);

  void profileById;

  return NextResponse.json({ data, currentUser });
}
