import type { ProspectContact } from "@/lib/prospecting-types";
import type { ExportColumn } from "@/lib/export";
import type { AppData, Lead } from "@/lib/types";
import { getUserName } from "@/lib/analytics";
import { getLeadStatusLabel, ADMIN_REVIEW_LABELS } from "@/lib/statuses";
import { getServiceTypeLabel } from "@/lib/service-types";
import { PROSPECT_PRIORITY_LABELS, PROSPECT_STATUS_LABELS } from "@/lib/prospecting-data";

export type { ExportColumn };

export const LEAD_EXPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "business", label: "Бизнес" },
  { key: "niche", label: "Ниша" },
  { key: "city", label: "Город" },
  { key: "contact", label: "Контакт" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Телефон" },
  { key: "telegram", label: "Telegram" },
  { key: "service", label: "Услуга" },
  { key: "source", label: "Источник" },
  { key: "status", label: "Статус" },
  { key: "review", label: "Проверка" },
  { key: "partner", label: "Партнёр" },
  { key: "manager", label: "Менеджер" },
  { key: "budget", label: "Бюджет ($)" },
  { key: "nextAction", label: "Следующий шаг" },
  { key: "created", label: "Дата добавления" },
];

export const MY_LEADS_EXPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "business", label: "Бизнес" },
  { key: "status", label: "Статус" },
  { key: "budget", label: "Бюджет" },
  { key: "created", label: "Дата добавления" },
];

export const DEALS_EXPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "client", label: "Клиент" },
  { key: "amount", label: "Сумма" },
  { key: "partner", label: "Партнёр" },
  { key: "commission", label: "Комиссия" },
  { key: "payment", label: "Оплата" },
];

export const PARTNER_LEADS_EXPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "business", label: "Бизнес" },
  { key: "status", label: "Статус" },
];

export const PROSPECT_EXPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "businessName", label: "Бизнес" },
  { key: "niche", label: "Ниша" },
  { key: "city", label: "Город" },
  { key: "source", label: "Источник" },
  { key: "website", label: "Сайт" },
  { key: "instagram", label: "Instagram" },
  { key: "telegram", label: "Telegram" },
  { key: "phone", label: "Телефон" },
  { key: "email", label: "Email" },
  { key: "status", label: "Статус" },
  { key: "priority", label: "Приоритет" },
  { key: "notes", label: "Заметки" },
  { key: "createdAt", label: "Добавлен" },
  { key: "updatedAt", label: "Обновлён" },
];

export const REPORT_EXPORT_COLUMNS = {
  leads: [
    { key: "business", label: "Бизнес" },
    { key: "status", label: "Статус" },
    { key: "partner", label: "Партнёр" },
    { key: "city", label: "Город" },
    { key: "source", label: "Источник" },
    { key: "created", label: "Дата" },
  ],
  deals: [
    { key: "client", label: "Клиент" },
    { key: "amount", label: "Сумма" },
    { key: "partner", label: "Партнёр" },
    { key: "payment", label: "Оплата" },
    { key: "commission", label: "Комиссия" },
  ],
  partners: [
    { key: "name", label: "Партнёр" },
    { key: "leads", label: "Клиентов" },
    { key: "deals", label: "Сделок" },
  ],
  payouts: [
    { key: "partner", label: "Партнёр" },
    { key: "amount", label: "Сумма" },
    { key: "status", label: "Статус" },
    { key: "date", label: "Дата" },
  ],
  conversion: [
    { key: "stage", label: "Этап" },
    { key: "count", label: "Количество" },
  ],
  sources: [
    { key: "source", label: "Источник" },
    { key: "count", label: "Количество" },
  ],
  services: [
    { key: "service", label: "Услуга" },
    { key: "revenue", label: "Выручка" },
  ],
} as const satisfies Record<string, ExportColumn<Record<string, unknown>>[]>;

export function formatExportDate(value: string | null | undefined): string {
  if (!value) return "";
  const datePart = value.slice(0, 10);
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return value;
  return `${d}.${m}.${y}`;
}

export function mapLeadForExport(lead: Lead, data: AppData): Record<string, unknown> {
  return {
    business: lead.businessName,
    niche: lead.niche,
    city: lead.city,
    contact: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    telegram: lead.telegramUsername,
    service: getServiceTypeLabel(lead.serviceType),
    source: lead.source,
    status: getLeadStatusLabel(lead.status),
    review: ADMIN_REVIEW_LABELS[lead.adminReviewStatus],
    partner: getUserName(data, lead.partnerId),
    manager: lead.assignedManagerId ? getUserName(data, lead.assignedManagerId) : "",
    budget: lead.estimatedBudget,
    nextAction: lead.nextAction,
    created: formatExportDate(lead.createdAt),
  };
}

export function mapProspectForExport(prospect: ProspectContact): Record<string, unknown> {
  return {
    businessName: prospect.businessName,
    niche: prospect.niche,
    city: prospect.city,
    source: prospect.source,
    website: prospect.website,
    instagram: prospect.instagram,
    telegram: prospect.telegram,
    phone: prospect.phone,
    email: prospect.email,
    status: PROSPECT_STATUS_LABELS[prospect.status] ?? prospect.status,
    priority: PROSPECT_PRIORITY_LABELS[prospect.priority] ?? prospect.priority,
    notes: prospect.notes,
    createdAt: formatExportDate(prospect.createdAt),
    updatedAt: formatExportDate(prospect.updatedAt),
  };
}
