import type { UserRole } from "@/lib/types";
import { getUserRoleLabel } from "@/lib/statuses";

const ACTION_LABELS: Record<string, string> = {
  lead_created: "Создан клиент",
  lead_approved: "Клиент одобрен",
  lead_rejected: "Клиент отклонён",
  approved: "Клиент одобрен",
  rejected: "Клиент отклонён",
  lead_marked_duplicate: "Клиент помечен как дубль",
  lead_do_not_contact: "Клиент: не трогать",
  deal_created: "Создана сделка",
  deal_marked_paid: "Сделка оплачена",
  deal_cancelled: "Сделка отменена",
  deal_refunded: "Сделка возвращена",
  payout_created: "Запрошена выплата",
  payout_paid: "Выплата отмечена оплаченной",
  payout_cancelled: "Выплата отменена",
  payouts_approved: "Выплаты одобрены",
  payouts_blocked: "Выплаты заблокированы",
  prospect_created: "Создан контакт",
  prospect_updated: "Контакт обновлён",
  prospect_deleted: "Контакт удалён",
  prospect_bulk_created: "Массовое создание контактов",
  prospect_converted_to_lead: "Контакт → клиент",
  admin_user_created: "Создан пользователь",
  user_blocked: "Пользователь заблокирован",
  password_changed: "Сменён пароль",
  commission_settings_updated: "Обновлены комиссии",
  legal_profile_updated: "Юр. профиль обновлён",
  legal_onboarding_completed: "Юр. онбординг завершён",
  partner_application_approved: "Заявка партнёра одобрена",
  partner_application_rejected: "Заявка партнёра отклонена",
  partner_application_suspended: "Партнёр приостановлен",
  partner_application_updated: "Заявка партнёра обновлена",
};

const ENTITY_LABELS: Record<string, string> = {
  lead: "Клиент",
  deal: "Сделка",
  payout: "Выплата",
  prospect_contact: "Контакт",
  profile: "Профиль",
  user: "Пользователь",
  user_legal_profile: "Юр. профиль",
  commission_settings: "Комиссии",
};

export function getAuditActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replaceAll("_", " ");
}

export function getAuditEntityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export function formatAuditActor(actor: {
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
} | null): { name: string; email: string | null; roleLabel: string | null } {
  if (!actor) {
    return { name: "Система / неизвестно", email: null, roleLabel: null };
  }
  const name = (actor.full_name?.trim() || actor.email || "Без имени").trim();
  const roleLabel =
    actor.role === "admin" || actor.role === "partner" || actor.role === "manager"
      ? getUserRoleLabel(actor.role as UserRole)
      : actor.role
        ? actor.role
        : null;
  return {
    name,
    email: actor.email ?? null,
    roleLabel,
  };
}
