import type { ProspectPriority, ProspectSource, ProspectStatus, WebsiteQuality } from "./prospecting-types";

export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Новый",
  needs_check: "Нужно проверить",
  checked: "Проверен",
  duplicate: "Дубль",
  not_relevant: "Не подходит",
  ready_to_message: "Можно писать",
  messaged: "Написали",
  follow_up_needed: "Нужен повтор",
  replied: "Ответил",
  converted_to_lead: "В лидах",
  do_not_contact: "Не трогать",
};

export const PROSPECT_PRIORITY_LABELS: Record<ProspectPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const WEBSITE_QUALITY_LABELS: Record<WebsiteQuality, string> = {
  no_website: "Нет сайта",
  bad: "Слабый",
  average: "Средний",
  good: "Хороший",
  unknown: "Не проверено",
};

export const PROSPECT_SOURCES: ProspectSource[] = [
  "2ГИС",
  "Google Maps",
  "Instagram",
  "Threads",
  "Telegram",
  "Сайт компании",
  "Kwork",
  "Fiverr",
  "Upwork",
  "Freelancer",
  "Знакомые",
  "Другое",
];

export const BOARD_COLUMNS: { status: ProspectStatus; label: string }[] = [
  { status: "new", label: "Новый" },
  { status: "needs_check", label: "Нужно проверить" },
  { status: "ready_to_message", label: "Можно писать" },
  { status: "messaged", label: "Написали" },
  { status: "follow_up_needed", label: "Нужен повтор" },
  { status: "replied", label: "Ответил" },
  { status: "converted_to_lead", label: "В лидах" },
  { status: "duplicate", label: "Дубль / не подходит" },
];

export const QUICK_NOTES = [
  "Сайта нет",
  "Сайт слабый",
  "Заявки только в Direct",
  "Нет онлайн-записи",
  "Нужен лендинг",
  "Нужен бот",
  "Нужна CRM",
  "Клиент ответил",
  "Не подходит",
  "Дубль",
];

export const FOLLOW_UP_TEMPLATE =
  "Здравствуйте! Хотел уточнить, актуален ли для вас сайт, бот или автоматизация заявок? Если сейчас не вовремя — ничего страшного.";

export const DAILY_GOALS = {
  found: 20,
  checked: 10,
  messaged: 5,
  replied: 1,
};

export const PROSPECT_NICHES = [
  "Строительство",
  "Ремонт квартир",
  "Салон красоты",
  "Барбершоп",
  "Стоматология",
  "Автосервис",
  "Клининг",
  "Доставка еды",
  "Фитнес",
  "Школа английского",
  "Другое",
];
