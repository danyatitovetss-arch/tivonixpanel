import type { UserRole } from "@/lib/types";
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
  manager: ["dashboard", "prospecting", "leads", "deals", "reports", "settings"],
  partner: ["dashboard", "academy", "prospecting", "leads", "deals", "reports", "settings"],
};

export function canAccessResource(role: UserRole, resource: AccessResource): boolean {
  return ROLE_RESOURCES[role]?.includes(resource) ?? false;
}

export function isDemoMode(): boolean {
  return isDemoModeEnv();
}

export { isDemoModeEnv };
