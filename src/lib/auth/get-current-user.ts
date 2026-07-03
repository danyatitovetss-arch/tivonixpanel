import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/lib/types";

export interface CurrentAuthUser {
  authId: string;
  email: string;
  profileId: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  crmAccess: boolean;
  onboardingComplete: boolean;
  blockedUnder16: boolean;
  requiresReaccept: boolean;
  mustChangePassword: boolean;
}

export async function getCurrentUser(): Promise<CurrentAuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  const { data: legal } = await supabase
    .from("user_legal_profiles")
    .select("crm_access, onboarding_status, age")
    .eq("user_id", user.id)
    .maybeSingle();

  const onboardingComplete = legal?.onboarding_status === "completed";
  const blockedUnder16 = legal?.onboarding_status === "blocked_under_16";
  const requiresReaccept = legal?.onboarding_status === "requires_reaccept";
  const mustChangePassword = user.user_metadata?.must_change_password === true;

  return {
    authId: user.id,
    email: profile.email ?? user.email ?? "",
    profileId: profile.id,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    status: profile.status as UserStatus,
    crmAccess: legal?.crm_access ?? false,
    onboardingComplete: onboardingComplete ?? false,
    blockedUnder16: blockedUnder16 ?? false,
    requiresReaccept: requiresReaccept ?? false,
    mustChangePassword,
  };
}
