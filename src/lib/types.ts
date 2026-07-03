export type UserRole = "admin" | "partner" | "manager";
export type UserStatus = "active" | "inactive" | "blocked";

export type LeadStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "duplicate"
  | "do_not_contact"
  | "contacted"
  | "replied"
  | "interested"
  | "sent_to_team"
  | "offer_sent"
  | "won"
  | "lost"
  | "no_response";

export type DealPaymentStatus =
  | "draft"
  | "waiting_payment"
  | "paid"
  | "cancelled"
  | "refunded";

export type CommissionStatus =
  | "not_accrued"
  | "pending"
  | "accrued"
  | "paid"
  | "cancelled";

export type PayoutStatus = "pending" | "paid" | "cancelled";

export type BalanceTransactionType =
  | "accrual"
  | "payout"
  | "correction"
  | "cancellation";

export type BalanceTransactionStatus = "pending" | "completed" | "cancelled";

export type AdminReviewStatus = "pending" | "approved" | "rejected" | "duplicate" | "do_not_contact";

export interface User {
  id: string;
  name: string;
  email: string;
  telegram: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface PartnerProfile {
  userId: string;
  phone: string;
  city: string;
  country: string;
  paymentMethod: string;
  paymentDetails: string;
  onboardingCompletedAt: string;
}

export interface Lead {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  contactName: string;
  email: string;
  instagramUrl: string;
  telegramUsername: string;
  phone: string;
  website: string;
  source: string;
  serviceType: string;
  estimatedBudget: number;
  status: LeadStatus;
  priority: "low" | "normal" | "high";
  partnerId: string;
  assignedManagerId: string | null;
  adminReviewStatus: AdminReviewStatus;
  adminReviewComment: string;
  nextAction: string;
  lastContactAt: string | null;
  reservedUntil: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  actionType: string;
  comment: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  partnerId: string;
  clientName: string;
  serviceType: string;
  amount: number;
  currency: string;
  commissionPercent: number;
  commissionAmount: number;
  partnerClosedDealsCountAtMoment: number;
  bonusApplied: boolean;
  paymentStatus: DealPaymentStatus;
  commissionStatus: CommissionStatus;
  closedAt: string;
  paidAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceTransaction {
  id: string;
  partnerId: string;
  dealId: string | null;
  payoutId: string | null;
  type: BalanceTransactionType;
  amount: number;
  currency: string;
  status: BalanceTransactionStatus;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  paymentMethod: string;
  paymentDetails: string;
  adminComment: string;
  paidAt: string | null;
  createdAt: string;
}

export interface CommissionSettings {
  id: string;
  basePercentUnder2000: number;
  basePercentFrom2000: number;
  bonusAfterClosedDeals: number;
  bonusPercent: number;
  currency: string;
  updatedAt: string;
}

export interface AppData {
  users: User[];
  leads: Lead[];
  leadActivities: LeadActivity[];
  deals: Deal[];
  balanceTransactions: BalanceTransaction[];
  payouts: Payout[];
  commissionSettings: CommissionSettings;
  prospectContacts: import("./prospecting-types").ProspectContact[];
  prospectActivities: import("./prospecting-types").ProspectActivity[];
  partnerProfiles: PartnerProfile[];
}

export type AccessAction =
  | "view_all_leads"
  | "view_own_leads"
  | "create_lead"
  | "approve_lead"
  | "reject_lead"
  | "mark_duplicate"
  | "create_deal"
  | "confirm_payment"
  | "create_payout"
  | "view_all_payouts"
  | "view_own_payouts"
  | "export_all"
  | "export_own"
  | "edit_commission_settings"
  | "view_all_partners"
  | "view_reports"
  | "assign_manager";

export type AccessResource =
  | "leads"
  | "deals"
  | "payouts"
  | "partners"
  | "settings"
  | "reports"
  | "prospecting"
  | "admin";
