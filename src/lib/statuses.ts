import type {
  LeadStatus,
  DealPaymentStatus,
  CommissionStatus,
  PayoutStatus,
  AdminReviewStatus,
  UserRole,
} from "./types";
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_SLUGS } from "./service-types";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  pending_review: "Ожидает проверки",
  approved: "Одобрен",
  rejected: "Отклонён",
  duplicate: "Дубль",
  do_not_contact: "Не трогать",
  contacted: "Написали",
  replied: "Ответил",
  interested: "Интересно",
  sent_to_team: "Передан команде",
  offer_sent: "КП отправлено",
  won: "Закрыт",
  lost: "Отказ",
  no_response: "Нет ответа",
};

export const DEAL_PAYMENT_LABELS: Record<DealPaymentStatus, string> = {
  draft: "Черновик",
  waiting_payment: "Ожидает оплату",
  paid: "Оплачено",
  cancelled: "Отменено",
  refunded: "Возврат",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  not_accrued: "Не начислена",
  pending: "Ожидает начисления",
  accrued: "Начислена",
  paid: "Выплачена",
  cancelled: "Отменена",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "Ожидает выплаты",
  paid: "Выплачено",
  cancelled: "Отменено",
};

export const ADMIN_REVIEW_LABELS: Record<AdminReviewStatus, string> = {
  pending: "На проверке",
  approved: "Одобрен",
  rejected: "Отклонён",
  duplicate: "Дубль",
  do_not_contact: "Не трогать",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Админ",
  partner: "Партнёр",
  manager: "Менеджер",
};

export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role];
}

export const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  not_started: "Не начат",
  in_progress: "В процессе",
  completed: "Завершён",
  blocked_under_16: "Заблокирован (<16)",
  requires_reaccept: "Нужно принять документы",
};

export function getOnboardingStatusLabel(status: string): string {
  return ONBOARDING_STATUS_LABELS[status] ?? status;
}

export const PAYOUT_ADMIN_STATUS_LABELS: Record<string, string> = {
  pending_admin_review: "На проверке",
  approved: "Одобрено",
  blocked: "Заблокировано",
};

export function getPayoutAdminStatusLabel(status: string): string {
  return PAYOUT_ADMIN_STATUS_LABELS[status] ?? status;
}

export const SERVICES = SERVICE_TYPE_SLUGS.map((slug) => SERVICE_TYPE_LABELS[slug]);

export const LEAD_SOURCES = [
  "Instagram",
  "Telegram",
  "Сайт",
  "Рекомендация",
  "Другое",
] as const;

export function getLeadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status];
}

export function isLeadInProgress(status: LeadStatus): boolean {
  return [
    "approved",
    "contacted",
    "replied",
    "interested",
    "sent_to_team",
    "offer_sent",
  ].includes(status);
}

export function isLeadPendingReview(status: LeadStatus): boolean {
  return status === "pending_review";
}

export function getStatusVariant(
  status: LeadStatus | AdminReviewStatus | string
): "default" | "success" | "secondary" | "outline" | "muted" | "warning" {
  switch (status) {
    case "pending_review":
    case "pending":
    case "waiting_payment":
      return "warning";
    case "won":
    case "paid":
    case "approved":
    case "accrued":
      return "success";
    case "rejected":
    case "lost":
    case "duplicate":
    case "cancelled":
      return "outline";
    default:
      return "muted";
  }
}
