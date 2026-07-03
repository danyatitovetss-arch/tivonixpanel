import type { LeadStatus } from "@/lib/types";

export interface PartnerStatusHelp {
  title: string;
  description: string;
  hint: string;
  tone: "neutral" | "success" | "warning" | "danger";
}

export const PARTNER_STATUS_HELP: Record<LeadStatus, PartnerStatusHelp> = {
  pending_review: {
    title: "Ожидает проверки",
    description: "Клиент отправлен команде TIVONIX. Админ проверит, нет ли дубля, и одобрит для работы.",
    hint: "Обычно проверка занимает 1–2 дня. Пока ждёте — ничего делать не нужно.",
    tone: "warning",
  },
  approved: {
    title: "Одобрен — можно работать",
    description: "Админ одобрил клиента. Можно писать клиенту или передать менеджеру.",
    hint: "Следуйте следующему шагу ниже.",
    tone: "success",
  },
  rejected: {
    title: "Отклонён",
    description: "Админ отклонил этого клиента. Причину смотрите в комментарии ниже.",
    hint: "По этому клиенту работа не ведётся.",
    tone: "danger",
  },
  duplicate: {
    title: "Дубль",
    description: "Такой клиент уже есть в базе. Писать повторно не нужно.",
    hint: "Если считаете, что это ошибка — напишите админу.",
    tone: "danger",
  },
  do_not_contact: {
    title: "Не трогать",
    description: "По этому клиенту уже идёт работа или писать нельзя.",
    hint: "Не связывайтесь с клиентом повторно.",
    tone: "danger",
  },
  contacted: {
    title: "Написали клиенту",
    description: "Первое сообщение отправлено. Ждём ответ.",
    hint: "Если нет ответа 3–5 дней — можно напомнить.",
    tone: "neutral",
  },
  replied: {
    title: "Клиент ответил",
    description: "Клиент ответил на сообщение. Нужно уточнить детали и интерес.",
    hint: "Зафиксируйте, что спросил клиент.",
    tone: "success",
  },
  interested: {
    title: "Клиент заинтересован",
    description: "Есть интерес к услуге. Можно готовить КП или передать команде.",
    hint: "Согласуйте следующий шаг с админом.",
    tone: "success",
  },
  sent_to_team: {
    title: "Передан команде TIVONIX",
    description: "Менеджер TIVONIX подключился к переговорам.",
    hint: "Следите за статусом в этой карточке.",
    tone: "neutral",
  },
  offer_sent: {
    title: "КП отправлено",
    description: "Коммерческое предложение отправлено клиенту.",
    hint: "Дождитесь решения клиента.",
    tone: "neutral",
  },
  won: {
    title: "Сделка закрыта",
    description: "Клиент оплатил или сделка успешно завершена.",
    hint: "Комиссия начисляется после подтверждения оплаты админом.",
    tone: "success",
  },
  lost: {
    title: "Отказ",
    description: "Клиент отказался от проекта.",
    hint: "Можно вернуться к клиенту позже, если админ разрешит.",
    tone: "danger",
  },
  no_response: {
    title: "Нет ответа",
    description: "Клиент пока не ответил на сообщение.",
    hint: "Можно напомнить через несколько дней.",
    tone: "warning",
  },
};

const TONE_STYLES = {
  neutral: "bg-[#f6f6f6] border-[#e5e5e5]",
  success: "bg-[#f0fdf4] border-[#bbf7d0]",
  warning: "bg-[#fffbeb] border-[#fde68a]",
  danger: "bg-[#fef2f2] border-[#fecaca]",
};

export function getPartnerStatusStyle(tone: PartnerStatusHelp["tone"]) {
  return TONE_STYLES[tone];
}
