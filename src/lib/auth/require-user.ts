import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";
import type { UserRole } from "@/lib/types";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === "blocked") redirect("/blocked");
  if (user.blockedUnder16) redirect("/blocked");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}

export async function requireCrmAccess() {
  const user = await requireUser();
  if (!user.crmAccess || !user.onboardingComplete || user.requiresReaccept) {
    redirect("/onboarding/legal");
  }
  return user;
}
