/** Подписи в интерфейсе — без CRM-жаргона «лид» */
export const CLIENT_COPY = {
  title: "Клиенты",
  titleMy: "Мои клиенты",
  description: "Компании и контакты, которых партнёры передают в работу",
  descriptionMy: "Ваши клиенты, сделки, баланс и выплаты",
  add: "Добавить клиента",
  save: "Сохранить клиента",
  saveAndReview: "Сохранить и отправить на проверку",
  notFound: "Клиенты не найдены",
  notFoundOne: "Клиент не найден или удалён",
  noAccess: "Нет доступа к этому клиенту",
  select: "Выберите клиента",
  selectCheckbox: "Выбрать клиента",
  openExisting: "Открыть существующего клиента",
  addedSuccess: "Клиент добавлен и отправлен на проверку",
  approved: "Клиент одобрен",
  rejected: "Клиент отклонён",
  total: "Всего клиентов",
  perDay: "Клиенты по дням",
  report: "Отчёт по клиентам",
  statuses: "Статусы клиентов",
  count: "Клиентов",
  countMonth: "Клиентов за месяц",
  pendingReview: "Клиент ожидает проверки",
  defaultName: "Клиент",
} as const;

export function clientCountLabel(count: number, forms: [string, string, string] = ["клиент", "клиента", "клиентов"]) {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${count} ${forms[2]}`;
  if (n1 > 1 && n1 < 5) return `${count} ${forms[1]}`;
  if (n1 === 1) return `${count} ${forms[0]}`;
  return `${count} ${forms[2]}`;
}

/** Ссылка на поддержку в Telegram (реквизиты, выплаты) */
export const SUPPORT_TELEGRAM_URL =
  process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM ?? "https://t.me/tivonixpartners";

export function supportTelegramMessageUrl(message: string): string {
  const base = SUPPORT_TELEGRAM_URL.split("?")[0];
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const PAYOUT_DETAILS_TELEGRAM_MESSAGE =
  "Здравствуйте! У меня начислилась первая комиссия от клиента. Прошу добавить реквизиты для выплат.";
