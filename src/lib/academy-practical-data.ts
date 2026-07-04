export interface PracticalPlatform {
  id: string;
  name: string;
  url: string;
  purpose: string;
  logoDomains: string[];
  searchQueries: string[];
  whoToLookFor?: string;
  whatToCheck: string[];
  steps?: string[];
  note?: string;
  queriesHint?: string;
}

export type { PriorityNiche, PriorityNicheOffer } from "./academy-niches-detailed";
export { PRIORITY_NICHES } from "./academy-niches-detailed";

export interface CoreMessageTemplate {
  id: string;
  title: string;
  text: string;
}

export interface DailyPlanLevel {
  title: string;
  items: string[];
}

export interface LeadExampleCard {
  title: string;
  fields: { label: string; value: string }[];
}

export const START_SUBTITLE =
  "Твоя задача — найти бизнес, которому нужен сайт, бот, CRM или автоматизация, написать ему, передать заинтересованного клиента в TIVONIX и получить выплату после сделки.";

export const START_WORKFLOW = [
  "Открой площадку для поиска.",
  "Найди 20–30 компаний.",
  "Напиши 5–10 потенциальным клиентам.",
  "Заинтересованного клиента добавь в CRM.",
  "После оплаты заказа получи процент.",
];

export const COMMON_NICHE_QUERIES = [
  "ремонт квартир",
  "салон красоты",
  "стоматология",
  "автосервис",
  "доставка еды",
  "строительная компания",
  "мебель на заказ",
  "клиника",
  "магазин одежды",
  "установка окон",
] as const;

export function queriesWithCitySuffix(queries: readonly string[]) {
  return queries.map((q) => `${q} + город`);
}

export const PRACTICAL_PLATFORMS: PracticalPlatform[] = [
  {
    id: "2gis",
    name: "2ГИС",
    url: "https://2gis.ru/",
    logoDomains: ["2gis.ru"],
    purpose:
      "Ищи локальные бизнесы: салоны, клиники, ремонты, доставки, автосервисы, магазины, строительные компании.",
    searchQueries: [...COMMON_NICHE_QUERIES],
    whatToCheck: [
      "есть ли сайт",
      "устаревший ли сайт",
      "есть ли кнопка онлайн-записи",
      "есть ли Telegram/Instagram",
      "много ли отзывов",
      "выглядит ли бизнес живым",
      "есть ли номер телефона или соцсети",
    ],
  },
  {
    id: "yandex-maps",
    name: "Яндекс Карты",
    url: "https://yandex.ru/maps/",
    logoDomains: ["yandex.ru"],
    purpose: "Ищи локальные компании по городу и нише.",
    queriesHint: "Выбери нишу и добавь название своего города в поиске.",
    searchQueries: [...COMMON_NICHE_QUERIES],
    whatToCheck: [
      "есть ли сайт в карточке",
      "есть ли соцсети",
      "есть ли онлайн-запись",
      "активны ли отзывы",
    ],
  },
  {
    id: "google-maps",
    name: "Google Maps",
    url: "https://www.google.com/maps",
    logoDomains: ["google.com"],
    purpose: "Компании с карточкой, но слабым сайтом или без нормальной онлайн-записи.",
    queriesHint: "Выбери нишу и добавь название своего города в Google Maps.",
    searchQueries: [...COMMON_NICHE_QUERIES],
    whatToCheck: [
      "есть ли сайт",
      "работает ли сайт с телефона",
      "есть ли форма заявки",
      "есть ли актуальные контакты",
    ],
  },
  {
    id: "kwork",
    name: "Kwork — проекты",
    url: "https://kwork.ru/projects",
    logoDomains: ["kwork.ru"],
    purpose: "Ищи уже горячих клиентов, которые сами разместили задачу.",
    searchQueries: [
      "разработка сайта",
      "лендинг",
      "Telegram бот",
      "CRM",
      "автоматизация",
      "доработка сайта",
      "интеграция",
      "парсер",
      "интернет-магазин",
    ],
    steps: [
      "Открыть раздел проектов.",
      "Найти проект по разработке или автоматизации.",
      "Посмотреть бюджет и задачу.",
      "Передать проект в TIVONIX или откликнуться по согласованному шаблону.",
    ],
    whatToCheck: ["бюджет проекта", "понятность задачи", "сроки", "есть ли контакт"],
  },
  {
    id: "avito",
    name: "Авито Услуги",
    url: "https://www.avito.ru/services",
    logoDomains: ["avito.ru"],
    purpose:
      "Ищи бизнесы и исполнителей, которым нужен сайт, реклама, CRM, бот, автоматизация или упаковка.",
    searchQueries: [...COMMON_NICHE_QUERIES],
    whatToCheck: [
      "есть ли у компании сайт",
      "красиво ли оформлена услуга",
      "есть ли онлайн-запись",
      "есть ли CRM/форма заявки",
      "можно ли усилить продажи через сайт, лендинг или бота",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/",
    logoDomains: ["instagram.com"],
    purpose: "Салоны, эксперты, магазины, доставки, студии ремонта, клиники, локальные бренды.",
    whoToLookFor: "салоны красоты, эксперты, магазины, доставки, студии ремонта, дизайнеры, клиники",
    queriesHint: "Выбери нишу и добавь город в поиске Instagram.",
    searchQueries: [...COMMON_NICHE_QUERIES],
    whatToCheck: [
      "есть ли ссылка на сайт",
      "работает ли ссылка",
      "есть ли запись через сообщения вручную",
      "есть ли прайс",
      "есть ли нормальная упаковка",
      "есть ли смысл предложить сайт/бот/CRM",
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    url: "https://web.telegram.org/",
    logoDomains: ["telegram.org"],
    purpose: "Бизнес-чаты города, предприниматели, услуги, локальные каналы.",
    whoToLookFor:
      "бизнес-чаты города, чаты предпринимателей, группы по ремонту, услуги, локальные каналы, маркетологи",
    searchQueries: ["чат предпринимателей", "бизнес чат", "услуги ремонт", "маркетинг чат"],
    whatToCheck: [
      "разрешены ли коммерческие сообщения",
      "есть ли запрос на IT-услуги",
      "можно ли написать лично",
    ],
    note: "Не делай спам. Пиши аккуратно, персонально и только тем, кому реально может быть полезна услуга.",
  },
  {
    id: "search-sites",
    name: "Google / Яндекс — сайты компаний",
    url: "https://www.google.com/",
    logoDomains: ["google.com", "yandex.ru"],
    purpose: "Найди компанию в поиске и проверь качество сайта.",
    queriesHint: "Запрос уже содержит «+ город» — подставь свой город.",
    searchQueries: [...queriesWithCitySuffix(COMMON_NICHE_QUERIES), "интернет-магазин + ниша"],
    whatToCheck: [
      "сайт старый",
      "нет мобильной версии",
      "долго грузится",
      "нет заявки/формы",
      "нет онлайн-записи",
      "плохой дизайн",
      "нет Telegram-бота",
      "нет CRM",
      "нет нормальной структуры услуг",
    ],
    note: "Также используй https://yandex.ru/ с теми же запросами.",
  },
];

export const CLIENT_FIT_YES = [
  "у бизнеса есть активность",
  "есть номер телефона или соцсети",
  "сайт старый или его нет",
  "нет онлайн-записи",
  "нет формы заявки",
  "соцсети ведутся, но нет нормального сайта",
  "бизнес продаёт услуги дороже 100–200$",
  "видно, что бизнесу нужны клиенты",
];

export const CLIENT_FIT_NO = [
  "компания закрыта",
  "нет контактов",
  "сайт и CRM уже сильные",
  "бизнес очень маленький и без бюджета",
  "страница заброшена",
  "непонятно, чем занимается компания",
];

export const CORE_MESSAGE_TEMPLATES: CoreMessageTemplate[] = [
  {
    id: "universal",
    title: "Универсальное первое сообщение",
    text: `Здравствуйте! Меня зовут [имя], я представляю команду TIVONIX.

Мы занимаемся разработкой сайтов, лендингов, CRM-систем, Telegram-ботов и автоматизацией бизнеса.

Посмотрел вашу компанию и вижу, что можно усилить онлайн-продажи: сделать удобную заявку, сайт/лендинг, автоматизацию или Telegram-бота под клиентов.

Можем бесплатно подсказать, что можно улучшить под вашу нишу.

Было бы актуально обсудить?`,
  },
  {
    id: "no-site",
    title: "Бизнес без сайта",
    text: `Здравствуйте! Увидел вашу компанию и заметил, что у вас нет отдельного сайта или удобной страницы для заявок.

Мы в TIVONIX делаем сайты, лендинги и Telegram-ботов, которые помогают бизнесу получать больше обращений и не терять клиентов.

Можем предложить решение под вашу нишу и показать, как это может выглядеть.

Актуально?`,
  },
  {
    id: "old-site",
    title: "Старый сайт",
    text: `Здравствуйте! Посмотрел ваш сайт. Видно, что бизнес живой, но сам сайт можно усилить: сделать современнее, удобнее с телефона и добавить нормальную форму заявки.

Мы в TIVONIX занимаемся сайтами, CRM и автоматизацией бизнес-процессов.

Можем бесплатно подсказать, что лучше доработать в первую очередь.

Интересно?`,
  },
  {
    id: "instagram",
    title: "Instagram",
    text: `Здравствуйте! У вас хорошо оформлен профиль, но заметил, что запись/заявки идут в основном через сообщения.

Мы в TIVONIX можем сделать сайт, мини-лендинг или Telegram-бота, чтобы клиентам было проще оставлять заявки, а вам — удобнее их обрабатывать.

Хотите, подскажем, как это можно реализовать именно под вашу нишу?`,
  },
  {
    id: "marketplace",
    title: "Kwork / биржи",
    text: `Здравствуйте! Видел вашу задачу по разработке.

Мы команда TIVONIX, занимаемся сайтами, CRM-системами, Telegram-ботами и автоматизацией.

Можем взять задачу в работу: сначала уточним детали, предложим структуру решения, сроки и стоимость.

Готовы обсудить проект?`,
  },
];

export const AFTER_REPLY_QUESTIONS = [
  "Чем занимается компания?",
  "Что нужно сделать: сайт, бот, CRM, автоматизация, доработка?",
  "Есть ли сейчас сайт или система?",
  "Что не устраивает сейчас?",
  "Какой результат хотите получить?",
  "Есть ли примерный бюджет?",
  "Как с вами удобнее связаться?",
];

export const AFTER_REPLY_CRM_STEPS = [
  'Перейди в раздел «Клиенты».',
  'Нажми «Добавить лида».',
  "Внеси имя/компанию/контакт.",
  "Опиши задачу клиента.",
  "Укажи источник: 2ГИС, Kwork, Авито, Instagram, Telegram, Яндекс Карты и т.д.",
  "Сохрани лида.",
];

export const DAILY_PLAN_LEVELS: DailyPlanLevel[] = [
  {
    title: "Минимум на день",
    items: [
      "открыть 1 площадку",
      "найти 20 компаний",
      "выбрать 10 подходящих",
      "написать 5 клиентам",
      "добавить всех заинтересованных в CRM",
    ],
  },
  {
    title: "Норма на день",
    items: [
      "2 площадки",
      "40 компаний",
      "20 проверенных",
      "10 сообщений",
      "1–2 потенциальных лида",
    ],
  },
  {
    title: "Сильный результат",
    items: [
      "3 площадки",
      "70 компаний",
      "30 сообщений",
      "3–5 диалогов",
      "1 качественный лид в CRM",
    ],
  },
];

export const DAILY_CHECKLIST_ITEMS = [
  "выбрал нишу",
  "открыл площадку",
  "нашёл 20 компаний",
  "написал 5 клиентам",
  "добавил лида",
  "сообщил команде",
];

export interface PlatformDifficultyItem {
  label: string;
  url?: string;
  logoDomain?: string;
}

export const PLATFORM_DIFFICULTY = [
  {
    id: "easy",
    level: "Легко начать",
    badge: "Старт",
    platforms: [
      { label: "2ГИС", url: "https://2gis.ru/", logoDomain: "2gis.ru" },
      { label: "Яндекс Карты", url: "https://yandex.ru/maps/", logoDomain: "yandex.ru" },
      { label: "Instagram", url: "https://www.instagram.com/", logoDomain: "instagram.com" },
      { label: "Telegram", url: "https://web.telegram.org/", logoDomain: "telegram.org" },
    ],
  },
  {
    id: "hot",
    level: "Уже горячие клиенты",
    badge: "Горячие",
    platforms: [
      { label: "Kwork проекты", url: "https://kwork.ru/projects", logoDomain: "kwork.ru" },
      { label: "фриланс-биржи", url: "https://www.fl.ru/", logoDomain: "fl.ru" },
      { label: "чаты предпринимателей", url: "https://web.telegram.org/", logoDomain: "telegram.org" },
    ],
  },
  {
    id: "advanced",
    level: "Для сильных партнёров",
    badge: "Сложнее",
    platforms: [
      { label: "холодные email/DM", url: "https://www.instagram.com/", logoDomain: "instagram.com" },
      { label: "анализ сайтов из Google", url: "https://www.google.com/", logoDomain: "google.com" },
      { label: "поиск компаний с рекламой", url: "https://yandex.ru/", logoDomain: "yandex.ru" },
      { label: "поиск бизнесов с плохим сайтом", url: "https://www.google.com/", logoDomain: "google.com" },
      { label: "партнёрства со знакомыми предпринимателями", logoDomain: "telegram.org", url: "https://web.telegram.org/" },
    ],
  },
] as const;

export type PlatformDifficultyId = (typeof PLATFORM_DIFFICULTY)[number]["id"];

export const SELECTION_PAYOUT = {
  title: "Условия на этапе отбора",
  intro: "Пока действуют условия для кандидатов:",
  tiers: [
    "10% от суммы заказа до 1000$",
    "15% от суммы заказа от 2000$ и выше",
  ],
  teamNote:
    "Мы будем смотреть на результаты и выберем 3 человека в постоянную команду TIVONIX.",
  topNote:
    "Для тех, кто покажет лучший результат и будет стабильно приводить качественных клиентов, условия будут уже другими — 50% от суммы заказа.",
  criteria:
    "Главный критерий — результат: качественные клиенты, реальные заказы и нормальная коммуникация.",
  gapNote:
    "Если сумма заказа от 1000$ до 2000$, условия нужно уточнять у команды индивидуально, чтобы не было путаницы.",
  payoutSteps: [
    "Клиент оплачивает заказ.",
    "Админ подтверждает сделку в CRM.",
    "Комиссия начисляется на баланс партнёра.",
    "Выплата проходит после подтверждения админом.",
  ],
};

export const LEAD_REJECT_MISTAKES = [
  "не добавил клиента в CRM",
  "не указал источник",
  "дал клиенту обещания без согласования",
  "назвал точную цену без команды",
  "написал клиенту грубо или спамно",
  "передал некачественный контакт",
  "клиент не понимает, что ему предлагают",
  "нет описания задачи",
  "нет контакта для связи",
  "лид уже был в CRM раньше",
];

export const PRACTICAL_LEAD_EXAMPLES: { good: LeadExampleCard; bad: LeadExampleCard } = {
  good: {
    title: "Хороший лид",
    fields: [
      { label: "Компания", value: "стоматология" },
      { label: "Источник", value: "2ГИС" },
      { label: "Проблема", value: "нет онлайн-записи, сайт старый" },
      { label: "Задача", value: "хочет обновить сайт и получать заявки" },
      { label: "Контакт", value: "телефон/Telegram" },
      { label: "Комментарий", value: "клиент заинтересован, ждёт примерную оценку" },
    ],
  },
  bad: {
    title: "Плохой лид",
    fields: [
      { label: "Компания", value: "неизвестно" },
      { label: "Источник", value: "не указан" },
      { label: "Проблема", value: "непонятно" },
      { label: "Контакт", value: "нет" },
      { label: "Комментарий", value: "«вроде нужен сайт»" },
    ],
  },
};

export const QUICK_LINKS = [
  { label: "Открыть 2ГИС", url: "https://2gis.ru/" },
  { label: "Открыть Яндекс Карты", url: "https://yandex.ru/maps/" },
  { label: "Открыть Google Maps", url: "https://www.google.com/maps" },
  { label: "Открыть Kwork проекты", url: "https://kwork.ru/projects" },
  { label: "Открыть Авито Услуги", url: "https://www.avito.ru/services" },
  { label: "Открыть Instagram", url: "https://www.instagram.com/" },
  { label: "Открыть Telegram Web", url: "https://web.telegram.org/" },
  { label: "Открыть Google", url: "https://www.google.com/" },
  { label: "Открыть Яндекс", url: "https://yandex.ru/" },
];

export const PRACTICAL_FAQ = [
  {
    question: "Где искать клиентов?",
    answer:
      "Начни с 2ГИС, Яндекс Карт, Instagram и Telegram. Для горячих заявок — Kwork проекты. Полный список площадок и запросов — в блоке «Где искать».",
  },
  {
    question: "Кому лучше писать в первую очередь?",
    answer:
      "Ремонт, строительство, салоны, стоматологии, автосервисы, доставка, мебель на заказ. Выбери одну нишу и работай с ней неделю.",
  },
  {
    question: "Что делать, если клиент ответил?",
    answer:
      "Задай 7 уточняющих вопросов, затем добавь лида в CRM с источником, контактом и описанием задачи.",
  },
  {
    question: "Нужно ли самому закрывать сделку?",
    answer: "Нет. Ты находишь и передаёшь клиента. Закрытием занимается команда TIVONIX.",
  },
  {
    question: "Когда начисляется выплата?",
    answer:
      "После оплаты клиентом и подтверждения сделки админом в CRM. Комиссия появляется на балансе партнёра.",
  },
  {
    question: "Что писать клиенту?",
    answer:
      "Используй готовые шаблоны в блоке «Что писать». Адаптируй под нишу — не копируй один текст всем подряд.",
  },
  {
    question: "Можно ли искать в 2ГИС, Авито, Kwork, Telegram и Instagram?",
    answer: "Да. Это основные площадки. Соблюдай правила площадки и не спамь.",
  },
  {
    question: "Что делать, если клиент задаёт технический вопрос?",
    answer:
      "Не отвечай за команду. Скажи, что уточнишь детали у специалистов TIVONIX, и добавь вопрос в CRM.",
  },
  {
    question: "Можно ли обещать цену и сроки?",
    answer: "Нет. Цену, сроки и скидки подтверждает только команда TIVONIX.",
  },
  {
    question: "Как попасть в постоянную команду на 50%?",
    answer:
      "Стабильно приводи качественных клиентов с реальными заказами. Мы выберем 3 лучших партнёров на этапе отбора.",
  },
];

export const PRACTICAL_ACADEMY_SECTIONS = [
  { id: "start", label: "Старт" },
  { id: "about-tivonix", label: "О TIVONIX" },
  { id: "payouts", label: "Выплаты" },
  { id: "platforms", label: "Где искать" },
  { id: "niches", label: "Кого искать" },
  { id: "templates", label: "Что писать" },
  { id: "after-reply", label: "Клиент ответил" },
  { id: "crm", label: "Добавить лида" },
  { id: "plan", label: "План на день" },
  { id: "mistakes", label: "Ошибки" },
  { id: "faq", label: "FAQ" },
] as const;

export const DAILY_CHECKLIST_STORAGE_KEY = "tivonix_academy_daily_checklist_v1";
