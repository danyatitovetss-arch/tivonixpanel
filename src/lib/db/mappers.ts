import type {
  User,
  Lead,
  LeadActivity,
  Deal,
  Payout,
  BalanceTransaction,
  CommissionSettings,
  PartnerProfile,
} from "@/lib/types";
import type { ProspectContact, ProspectActivity } from "@/lib/prospecting-types";
import { getServiceTypeLabel } from "@/lib/service-types";

function isoDate(v: string | null | undefined): string {
  if (!v) return "";
  return v.slice(0, 10);
}

function isoDateTime(v: string | null | undefined): string | null {
  return v ?? null;
}

export function mapProfile(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.full_name ?? row.email ?? ""),
    email: String(row.email ?? ""),
    telegram: String(row.telegram ?? ""),
    role: row.role as User["role"],
    status: row.status as User["status"],
    createdAt: isoDate(row.created_at as string),
  };
}

export function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    businessName: String(row.business_name ?? ""),
    niche: String(row.niche ?? ""),
    city: String(row.city ?? ""),
    contactName: String(row.contact_name ?? ""),
    email: String(row.email ?? ""),
    instagramUrl: String(row.instagram_url ?? ""),
    telegramUsername: String(row.telegram_username ?? ""),
    phone: String(row.phone ?? ""),
    website: String(row.website ?? ""),
    source: String(row.source ?? ""),
    serviceType: getServiceTypeLabel(String(row.service_type ?? "")),
    estimatedBudget: Number(row.estimated_budget ?? 0),
    status: row.status as Lead["status"],
    priority: (row.priority as Lead["priority"]) ?? "normal",
    partnerId: String(row.partner_id),
    assignedManagerId: row.assigned_manager_id ? String(row.assigned_manager_id) : null,
    adminReviewStatus: row.admin_review_status as Lead["adminReviewStatus"],
    adminReviewComment: String(row.admin_review_comment ?? ""),
    nextAction: String(row.next_action ?? ""),
    lastContactAt: isoDateTime(row.last_contact_at as string),
    reservedUntil: isoDateTime(row.reserved_until as string),
    notes: String(row.notes ?? ""),
    createdAt: isoDate(row.created_at as string),
    updatedAt: isoDate(row.updated_at as string),
  };
}

export function mapLeadActivity(row: Record<string, unknown>): LeadActivity {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    userId: String(row.user_id),
    actionType: String(row.action_type),
    comment: String(row.comment ?? ""),
    oldValue: String(row.old_value ?? ""),
    newValue: String(row.new_value ?? ""),
    createdAt: String(row.created_at),
  };
}

export function mapDeal(row: Record<string, unknown>): Deal {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    partnerId: String(row.partner_id),
    clientName: String(row.client_name ?? ""),
    serviceType: getServiceTypeLabel(String(row.service_type ?? "")),
    amount: Number(row.amount),
    currency: String(row.currency ?? "USD"),
    commissionPercent: Number(row.commission_percent ?? 0),
    commissionAmount: Number(row.commission_amount ?? 0),
    partnerClosedDealsCountAtMoment: Number(row.partner_closed_deals_count_at_moment ?? 0),
    bonusApplied: Boolean(row.bonus_applied),
    paymentStatus: row.payment_status as Deal["paymentStatus"],
    commissionStatus: row.commission_status as Deal["commissionStatus"],
    closedAt: isoDate(row.closed_at as string),
    paidAt: row.paid_at ? isoDate(row.paid_at as string) : null,
    notes: String(row.notes ?? ""),
    createdAt: isoDate(row.created_at as string),
    updatedAt: isoDate(row.updated_at as string),
  };
}

export function mapPayout(row: Record<string, unknown>): Payout {
  return {
    id: String(row.id),
    partnerId: String(row.partner_id),
    amount: Number(row.amount),
    currency: String(row.currency ?? "USD"),
    status: row.status as Payout["status"],
    paymentMethod: String(row.payment_method ?? ""),
    paymentDetails: String(row.payment_details ?? ""),
    adminComment: String(row.admin_comment ?? ""),
    paidAt: row.paid_at ? isoDate(row.paid_at as string) : null,
    createdAt: isoDate(row.created_at as string),
  };
}

export function mapBalanceTransaction(row: Record<string, unknown>): BalanceTransaction {
  return {
    id: String(row.id),
    partnerId: String(row.partner_id),
    dealId: row.deal_id ? String(row.deal_id) : null,
    payoutId: row.payout_id ? String(row.payout_id) : null,
    type: row.type as BalanceTransaction["type"],
    amount: Number(row.amount),
    currency: String(row.currency ?? "USD"),
    status: row.status as BalanceTransaction["status"],
    description: String(row.description ?? ""),
    createdBy: String(row.created_by ?? ""),
    createdAt: String(row.created_at),
  };
}

export function mapCommissionSettings(row: Record<string, unknown>): CommissionSettings {
  return {
    id: String(row.id),
    basePercentUnder2000: Number(row.base_percent_under_2000 ?? 10),
    basePercentFrom2000: Number(row.base_percent_from_2000 ?? 15),
    bonusAfterClosedDeals: Number(row.bonus_after_closed_deals ?? 3),
    bonusPercent: Number(row.bonus_percent ?? 10),
    currency: String(row.currency ?? "USD"),
    updatedAt: String(row.updated_at),
  };
}

export function mapProspectContact(row: Record<string, unknown>): ProspectContact {
  return {
    id: String(row.id),
    businessName: String(row.business_name ?? ""),
    niche: String(row.niche ?? ""),
    city: String(row.city ?? ""),
    source: String(row.source ?? ""),
    website: String(row.website ?? ""),
    instagram: String(row.instagram ?? ""),
    telegram: String(row.telegram ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    contactPerson: String(row.contact_person ?? ""),
    status: row.status as ProspectContact["status"],
    priority: (row.priority as ProspectContact["priority"]) ?? "medium",
    websiteQuality: (row.website_quality as ProspectContact["websiteQuality"]) ?? "unknown",
    hasWebsite: row.has_website == null ? null : Boolean(row.has_website),
    hasOnlineBooking: Boolean(row.has_online_booking),
    hasTelegramBot: Boolean(row.has_telegram_bot),
    hasCRM: Boolean(row.has_crm),
    painPoints: String(row.pain_points ?? ""),
    messageTemplateUsed: String(row.message_template_used ?? ""),
    firstMessageSentAt: row.first_message_sent_at ? isoDate(row.first_message_sent_at as string) : null,
    followUpAt: row.follow_up_at ? isoDate(row.follow_up_at as string) : null,
    followUpSent: false,
    lastActionAt: row.last_action_at ? isoDate(row.last_action_at as string) : null,
    notes: String(row.notes ?? ""),
    duplicateLeadId: row.duplicate_lead_id ? String(row.duplicate_lead_id) : null,
    convertedLeadId: row.converted_lead_id ? String(row.converted_lead_id) : null,
    createdBy: String(row.created_by ?? row.partner_id ?? ""),
    createdAt: isoDate(row.created_at as string),
    updatedAt: isoDate(row.updated_at as string),
  };
}

export function mapProspectActivity(row: Record<string, unknown>): ProspectActivity {
  return {
    id: String(row.id),
    prospectId: String(row.prospect_id),
    userId: String(row.user_id),
    actionType: String(row.action_type),
    comment: String(row.comment ?? ""),
    createdAt: String(row.created_at),
  };
}

export function mapPartnerProfile(row: Record<string, unknown>, profileId: string): PartnerProfile {
  return {
    userId: profileId,
    phone: String(row.phone ?? ""),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    paymentMethod: String(row.payout_preference ?? ""),
    paymentDetails: String(row.organization_name ?? ""),
    onboardingCompletedAt: row.onboarding_status === "completed" ? isoDate(row.updated_at as string) : "",
  };
}

export function mapProspectInput(input: Record<string, unknown>) {
  return {
    business_name: input.businessName,
    niche: input.niche,
    city: input.city,
    source: input.source,
    website: input.website,
    instagram: input.instagram,
    telegram: input.telegram,
    phone: input.phone,
    email: input.email || null,
    contact_person: input.contactPerson,
    status: input.status ?? "new",
    priority: input.priority ?? "medium",
    website_quality: input.websiteQuality ?? "unknown",
    has_website: input.hasWebsite,
    has_online_booking: input.hasOnlineBooking ?? false,
    has_telegram_bot: input.hasTelegramBot ?? false,
    has_crm: input.hasCrm ?? false,
    pain_points: input.painPoints,
    notes: input.notes,
    first_message_sent_at: input.firstMessageSentAt ?? null,
    follow_up_at: input.followUpAt ?? null,
    duplicate_lead_id: input.duplicateLeadId ?? null,
  };
}
