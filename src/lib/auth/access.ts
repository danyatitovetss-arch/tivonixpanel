/**
 * Single source of truth for role → resource access.
 * Must stay aligned with src/lib/access.ts RESOURCE_ACCESS.
 */
import type { AccessResource as UiAccessResource, UserRole } from "@/lib/types";
import { canAccessResource as canUserAccessResource } from "@/lib/access";
import { isDemoMode as isDemoModeEnv } from "@/lib/demo-mode";

export type AccessResource =
  | "dashboard"
  | "academy"
  | "prospecting"
  | "leads"
  | "deals"
  | "partners"
  | "payouts"
  | "reports"
  | "settings"
  | "admin";

/** Align with src/lib/access.ts RESOURCE_ACCESS. */
const ROLE_RESOURCES: Record<UserRole, AccessResource[]> = {
  admin: [
    "dashboard",
    "academy",
    "prospecting",
    "leads",
    "deals",
    "partners",
    "payouts",
    "reports",
    "settings",
    "admin",
  ],
  manager: ["dashboard", "prospecting", "leads", "deals", "partners"],
  partner: ["dashboard", "academy", "prospecting", "leads", "deals"],
};

export function canAccessResource(role: UserRole, resource: AccessResource): boolean {
  return ROLE_RESOURCES[role]?.includes(resource) ?? false;
}

/** Bridge: check whether a role may access a UI resource from the user-centric matrix. */
export function canRoleAccessUiResource(role: UserRole, resource: UiAccessResource): boolean {
  const fakeUser = {
    id: "",
    name: "",
    email: "",
    telegram: "",
    role,
    status: "active" as const,
    partnerType: null,
    agencyName: null,
    websiteUrl: null,
    commissionPercentOverride: null,
    assignedManagerId: null,
    createdAt: "",
  };
  return canUserAccessResource(fakeUser, resource);
}

export function isDemoMode(): boolean {
  return isDemoModeEnv();
}

export { isDemoModeEnv };
