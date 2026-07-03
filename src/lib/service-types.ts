export const SERVICE_TYPE_SLUGS = [
  "landing",
  "website",
  "telegram_bot",
  "crm",
  "ai_automation",
  "design",
  "project_rework",
  "other",
] as const;

export type ServiceTypeSlug = (typeof SERVICE_TYPE_SLUGS)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceTypeSlug, string> = {
  landing: "Лендинг",
  website: "Сайт",
  telegram_bot: "Telegram-бот",
  crm: "CRM",
  ai_automation: "AI-автоматизация",
  design: "Дизайн",
  project_rework: "Доработка проекта",
  other: "Другое",
};

export const SERVICE_TYPE_OPTIONS = SERVICE_TYPE_SLUGS.map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));

const RUSSIAN_TO_SLUG: Record<string, ServiceTypeSlug> = {
  Лендинг: "landing",
  Сайт: "website",
  "Telegram-бот": "telegram_bot",
  CRM: "crm",
  "AI-автоматизация": "ai_automation",
  Дизайн: "design",
  "Доработка проекта": "project_rework",
  "Доработка сайта": "project_rework",
  "Онлайн-запись": "other",
  Другое: "other",
};

export function toServiceTypeSlug(value: string | null | undefined): ServiceTypeSlug {
  if (!value) return "landing";
  if (SERVICE_TYPE_SLUGS.includes(value as ServiceTypeSlug)) {
    return value as ServiceTypeSlug;
  }
  return RUSSIAN_TO_SLUG[value] ?? "other";
}

export function getServiceTypeLabel(value: string | null | undefined): string {
  if (!value) return "";
  const slug = toServiceTypeSlug(value);
  return SERVICE_TYPE_LABELS[slug] ?? value;
}
