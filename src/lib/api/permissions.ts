import type { UserRole } from "@/lib/types";
import type { ProspectStatus } from "@/lib/prospecting-types";
import type { LeadStatus } from "@/lib/types";

/** Статусы лида, которые партнёр может менять сам (без admin/manager). */
export const PARTNER_LEAD_STATUSES: LeadStatus[] = [
  "contacted",
  "replied",
  "interested",
  "sent_to_team",
  "offer_sent",
  "no_response",
];

/** Статусы prospect, которые партнёр может выставлять вручную. */
export const PARTNER_PROSPECT_STATUSES: ProspectStatus[] = [
  "new",
  "needs_check",
  "checked",
  "ready_to_message",
  "messaged",
  "follow_up_needed",
  "replied",
  "not_relevant",
  "do_not_contact",
];

export function canManageLeadWorkflow(role: UserRole): boolean {
  return role === "admin" || role === "manager";
}

export function assertPartnerLeadStatus(status: string): boolean {
  return PARTNER_LEAD_STATUSES.includes(status as LeadStatus);
}

export function assertPartnerProspectStatus(status: string): boolean {
  return PARTNER_PROSPECT_STATUSES.includes(status as ProspectStatus);
}
