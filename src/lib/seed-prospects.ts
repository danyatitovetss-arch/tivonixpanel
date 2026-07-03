import type { ProspectActivity, ProspectContact, ProspectStatus } from "./prospecting-types";

const PARTNER = "u-andrey";

function mk(
  id: string,
  businessName: string,
  niche: string,
  city: string,
  source: string,
  status: ProspectStatus,
  opts: Partial<ProspectContact> = {}
): ProspectContact {
  const ts = opts.createdAt ?? "2026-07-01";
  return {
    id,
    businessName,
    niche,
    city,
    source,
    website: opts.website ?? "",
    instagram: opts.instagram ?? "",
    telegram: opts.telegram ?? "",
    phone: opts.phone ?? "",
    email: opts.email ?? "",
    contactPerson: opts.contactPerson ?? "",
    status,
    priority: opts.priority ?? "medium",
    websiteQuality: opts.websiteQuality ?? "unknown",
    hasWebsite: opts.hasWebsite ?? null,
    hasOnlineBooking: opts.hasOnlineBooking ?? false,
    hasTelegramBot: opts.hasTelegramBot ?? false,
    hasCRM: opts.hasCRM ?? false,
    painPoints: opts.painPoints ?? "",
    messageTemplateUsed: opts.messageTemplateUsed ?? "",
    firstMessageSentAt: opts.firstMessageSentAt ?? null,
    followUpAt: opts.followUpAt ?? null,
    followUpSent: opts.followUpSent ?? false,
    lastActionAt: opts.lastActionAt ?? ts,
    notes: opts.notes ?? "",
    duplicateLeadId: opts.duplicateLeadId ?? null,
    convertedLeadId: opts.convertedLeadId ?? null,
    createdBy: opts.createdBy ?? PARTNER,
    createdAt: ts,
    updatedAt: opts.updatedAt ?? ts,
  };
}

export function createSeedProspects(): {
  prospectContacts: ProspectContact[];
  prospectActivities: ProspectActivity[];
} {
  const prospectContacts: ProspectContact[] = [
    mk("pc1", "СтройДом Минск", "Строительство", "Минск", "2ГИС", "ready_to_message", {
      priority: "high",
      hasWebsite: false,
      websiteQuality: "no_website",
      painPoints: "Нет сайта, заявки по телефону",
      phone: "+375291234567",
      notes: "Хорошие отзывы в 2ГИС",
    }),
    mk("pc2", "РемонтПлюс", "Ремонт квартир", "Минск", "Google Maps", "needs_check", {
      website: "remontplus.by",
      websiteQuality: "bad",
      hasWebsite: true,
      painPoints: "Слабый сайт, нет формы заявки",
    }),
    mk("pc3", "Beauty Lab", "Салон красоты", "Минск", "Instagram", "messaged", {
      instagram: "instagram.com/beautylab_minsk",
      hasWebsite: false,
      websiteQuality: "no_website",
      painPoints: "Запись только в Direct",
      firstMessageSentAt: "2026-07-02",
      messageTemplateUsed: "salon",
    }),
    mk("pc4", "Barber City", "Барбершоп", "Минск", "Instagram", "follow_up_needed", {
      instagram: "instagram.com/barbercity_msk",
      painPoints: "Нет онлайн-записи",
      firstMessageSentAt: "2026-06-28",
      followUpAt: "2026-07-03",
      priority: "high",
    }),
    mk("pc5", "AutoFix", "Автосервис", "Минск", "2ГИС", "checked", {
      phone: "+375331112233",
      hasWebsite: false,
      websiteQuality: "no_website",
      painPoints: "Только телефон",
    }),
    mk("pc6", "Dental Pro", "Стоматология", "Минск", "Google Maps", "ready_to_message", {
      website: "dentalpro.by",
      websiteQuality: "bad",
      hasWebsite: true,
      painPoints: "Слабый сайт, нет записи онлайн",
    }),
    mk("pc7", "CleanHome", "Клининг", "Минск", "Сайт компании", "new", {
      website: "cleanhome.by",
      websiteQuality: "average",
      painPoints: "Нет калькулятора стоимости",
    }),
    mk("pc8", "FoodBox", "Доставка еды", "Минск", "Instagram", "messaged", {
      instagram: "instagram.com/foodbox_minsk",
      painPoints: "Заказы в Direct",
      firstMessageSentAt: "2026-07-01",
    }),
    mk("pc9", "FitRoom", "Фитнес", "Минск", "Instagram", "needs_check", {
      instagram: "instagram.com/fitroom_minsk",
      painPoints: "Нет расписания онлайн",
    }),
    mk("pc10", "English Start", "Школа английского", "Минск", "Google Maps", "checked", {
      website: "englishstart.by",
      websiteQuality: "bad",
      painPoints: "Нет формы пробного урока",
    }),
    mk("pc11", "МебельHouse", "Мебель", "Минск", "Instagram", "new", {
      instagram: "instagram.com/mebelhouse",
      painPoints: "Каталог только в Instagram",
    }),
    mk("pc12", "LegalPro", "Юридические услуги", "Минск", "2ГИС", "ready_to_message", {
      website: "legalpro.by",
      websiteQuality: "bad",
      painPoints: "Нет формы консультации",
    }),
    mk("pc13", "TourMinsk", "Туризм", "Минск", "Instagram", "replied", {
      instagram: "instagram.com/tourminsk",
      painPoints: "Нет формы бронирования",
      firstMessageSentAt: "2026-06-25",
      notes: "Клиент интересуется лендингом",
    }),
    mk("pc14", "EventStars", "Event", "Минск", "Instagram", "needs_check", {
      instagram: "instagram.com/eventstars",
      painPoints: "Портфолио только в Instagram",
    }),
    mk("pc15", "CoffeePoint", "Кофейня", "Минск", "Google Maps", "checked", {
      painPoints: "Меню только в соцсетях",
    }),
    mk("pc16", "DetailingPro", "Детейлинг", "Минск", "Instagram", "messaged", {
      instagram: "instagram.com/detailingpro",
      firstMessageSentAt: "2026-06-30",
      followUpAt: "2026-07-04",
    }),
    mk("pc17", "MedCenter+", "Медицинский центр", "Минск", "2ГИС", "duplicate", {
      website: "autofix-pro.ru",
      duplicateLeadId: "l2",
      notes: "Похоже на дубль AutoFix Pro",
    }),
    mk("pc18", "OnlineSchool X", "Онлайн-школа", "Минск", "Telegram", "ready_to_message", {
      telegram: "@onlineschool_x",
      painPoints: "Заявки в таблицах",
    }),
    mk("pc19", "BuildMaster", "Строительство", "Минск", "2ГИС", "converted_to_lead", {
      phone: "+375441234567",
      convertedLeadId: "l1",
      status: "converted_to_lead",
    }),
    mk("pc20", "NailStudio", "Салон красоты", "Минск", "Instagram", "not_relevant", {
      instagram: "instagram.com/nailstudio",
      notes: "Не отвечают, закрылись",
    }),
    mk("pc21", "AutoWash 24", "Автомойка", "Минск", "Google Maps", "new", {
      phone: "+375251112233",
      createdAt: "2026-07-03",
      updatedAt: "2026-07-03",
    }),
    mk("pc22", "KidsEnglish", "Школа английского", "Минск", "2ГИС", "follow_up_needed", {
      website: "kidsenglish.by",
      websiteQuality: "bad",
      firstMessageSentAt: "2026-06-27",
      followUpAt: "2026-07-03",
      followUpSent: false,
    }),
    mk("pc23", "RepairFast", "Ремонт квартир", "Минск", "Kwork", "checked", {
      painPoints: "Нужен лендинг под рекламу",
      source: "Kwork",
    }),
    mk("pc24", "Glow Nails", "Салон красоты", "Минск", "Instagram", "do_not_contact", {
      instagram: "instagram.com/glowstudio_msk",
      duplicateLeadId: "l1",
      notes: "Уже есть в CRM как Glow Studio",
    }),
    mk("pc25", "PizzaGo", "Доставка еды", "Минск", "Instagram", "replied", {
      instagram: "instagram.com/pizzago",
      firstMessageSentAt: "2026-07-02",
      notes: "Спросил цену на бота",
      priority: "high",
    }),
  ];

  const prospectActivities: ProspectActivity[] = [
    { id: "pa1", prospectId: "pc3", userId: PARTNER, actionType: "messaged", comment: "Отправлено первое сообщение", createdAt: "2026-07-02T10:00:00.000Z" },
    { id: "pa2", prospectId: "pc13", userId: PARTNER, actionType: "replied", comment: "Клиент ответил, интересуется лендингом", createdAt: "2026-06-26T14:00:00.000Z" },
    { id: "pa3", prospectId: "pc19", userId: PARTNER, actionType: "converted", comment: "Добавлен в лиды", createdAt: "2026-06-20T09:00:00.000Z" },
  ];

  return { prospectContacts, prospectActivities };
}
