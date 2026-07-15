import type { AppData, Lead, Deal, Payout, LeadActivity, BalanceTransaction } from "./types";
import { DEFAULT_COMMISSION_SETTINGS } from "./commission";
import { calculateCommission } from "./commission";
import { createSeedProspects } from "./seed-prospects";
import { createSeedPartnerProfiles } from "./partner-profiles-seed";

const now = () => new Date().toISOString();

export const DEMO_USERS = {
  admin: "u-admin",
  partner: "u-andrey",
  manager: "u-maxim",
} as const;

function createSeedData(): AppData {
  const settings = {
    id: "cs-1",
    ...DEFAULT_COMMISSION_SETTINGS,
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const users = [
    {
      id: "u-admin",
      name: "Admin Demo",
      email: "admin.demo@example.com",
      telegram: "@demo_admin",
      role: "admin" as const,
      status: "active" as const,
      partnerType: null,
      agencyName: null,
      websiteUrl: null,
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-01-01",
    },
    {
      id: "u-andrey",
      name: "Partner Alpha",
      email: "partner.alpha@example.com",
      telegram: "@demo_partner_a",
      role: "partner" as const,
      status: "active" as const,
      partnerType: "referral" as const,
      agencyName: null,
      websiteUrl: null,
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-01-15",
    },
    {
      id: "u-maxim",
      name: "Manager Demo",
      email: "manager.demo@example.com",
      telegram: "@demo_manager",
      role: "manager" as const,
      status: "active" as const,
      partnerType: null,
      agencyName: null,
      websiteUrl: null,
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-02-01",
    },
    {
      id: "u-artem",
      name: "Partner Beta",
      email: "partner.beta@example.com",
      telegram: "@demo_partner_b",
      role: "partner" as const,
      status: "active" as const,
      partnerType: "white_label" as const,
      agencyName: "Demo Agency",
      websiteUrl: "https://example.com",
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-02-10",
    },
    {
      id: "u-ilya",
      name: "Partner Gamma",
      email: "partner.gamma@example.com",
      telegram: "@demo_partner_c",
      role: "partner" as const,
      status: "inactive" as const,
      partnerType: "referral" as const,
      agencyName: null,
      websiteUrl: null,
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-03-01",
    },
    {
      id: "u-nikita",
      name: "Partner Delta",
      email: "partner.delta@example.com",
      telegram: "@demo_partner_d",
      role: "partner" as const,
      status: "inactive" as const,
      partnerType: "referral" as const,
      agencyName: null,
      websiteUrl: null,
      commissionPercentOverride: null,
      assignedManagerId: null,
      createdAt: "2026-03-15",
    },
  ];

  const leads: Lead[] = [
    mkLead("l1", "Glow Studio", "Салон красоты", "Москва", "u-andrey", "pending_review", "pending", "2026-07-01", { ig: "glowstudio_msk", tg: "glowstudio_alina", phone: "+79161234567" }),
    mkLead("l2", "AutoFix Pro", "Автосервис", "Санкт-Петербург", "u-andrey", "contacted", "approved", "2026-06-28", { tg: "autofix_sergey", web: "autofix-pro.ru" }),
    mkLead("l3", "FoodGo Delivery", "Доставка еды", "Казань", "u-maxim", "replied", "approved", "2026-06-25", { ig: "foodgo_kzn" }),
    mkLead("l4", "RemontPlus", "Ремонт квартир", "Москва", "u-artem", "interested", "approved", "2026-06-22", { web: "remontplus.moscow" }),
    mkLead("l5", "SmileDent", "Стоматология", "Екатеринбург", "u-admin", "offer_sent", "approved", "2026-06-20", { ig: "smiledent_ekb" }),
    mkLead("l6", "English Hub", "Школа английского", "Новосибирск", "u-nikita", "sent_to_team", "approved", "2026-06-18", { tg: "englishhub_elena" }),
    mkLead("l7", "FitZone", "Фитнес-студия", "Москва", "u-artem", "won", "approved", "2026-06-10", { ig: "fitzone_moscow" }),
    mkLead("l8", "MebelLux", "Магазин мебели", "Краснодар", "u-ilya", "lost", "approved", "2026-06-08", { web: "mebellux.shop" }),
    mkLead("l9", "DomRealty", "Агентство недвижимости", "Санкт-Петербург", "u-admin", "pending_review", "pending", "2026-07-02", { tg: "domrealty_anna" }),
    mkLead("l10", "Brew Coffee", "Кофейня", "Москва", "u-maxim", "no_response", "approved", "2026-06-15", { ig: "brewcoffee_msk" }),
    mkLead("l11", "StyleRoom", "Магазин одежды", "Казань", "u-andrey", "duplicate", "duplicate", "2026-06-12", { ig: "styleroom_kzn" }),
    mkLead("l12", "StroyMaster", "Строительная компания", "Ростов-на-Дону", "u-artem", "interested", "approved", "2026-06-05", { web: "stroymaster-rnd.ru" }),
    mkLead("l13", "NailArt Studio", "Салон красоты", "Воронеж", "u-admin", "contacted", "approved", "2026-06-30", { ig: "nailart_vrn" }),
    mkLead("l14", "TurboService", "Автосервис", "Самара", "u-ilya", "do_not_contact", "do_not_contact", "2026-05-28", { web: "turboservice-samara.ru" }),
    mkLead("l15", "PizzaExpress", "Доставка еды", "Москва", "u-andrey", "replied", "approved", "2026-06-27", { tg: "pizzaexpress_roman" }),
    mkLead("l16", "WhiteSmile Clinic", "Стоматология", "Москва", "u-maxim", "sent_to_team", "approved", "2026-06-14", { ig: "whitesmile_clinic" }),
    mkLead("l17", "UrbanFit", "Фитнес-студия", "Санкт-Петербург", "u-artem", "approved", "approved", "2026-07-03", { ig: "urbanfit_spb" }),
    mkLead("l18", "HomeDecor", "Магазин мебели", "Москва", "u-admin", "offer_sent", "approved", "2026-06-11", { web: "homedecor-moscow.ru" }),
  ];

  const deals: Deal[] = [];
  const balanceTransactions: BalanceTransaction[] = [];
  const payouts: Payout[] = [];

  const dealSpecs = [
    { id: "d1", leadId: "l7", partnerId: "u-artem", client: "FitZone", service: "Сайт", amount: 1500, paid: true, closedAt: "2026-06-20" },
    { id: "d2", leadId: "l4", partnerId: "u-artem", client: "RemontPlus", service: "CRM", amount: 2000, paid: true, closedAt: "2026-06-18" },
    { id: "d3", leadId: "l6", partnerId: "u-nikita", client: "English Hub", service: "AI-автоматизация", amount: 3000, paid: true, closedAt: "2026-06-25" },
    { id: "d4", leadId: "l12", partnerId: "u-artem", client: "StroyMaster", service: "AI-автоматизация", amount: 2500, paid: false, closedAt: "2026-06-28" },
    { id: "d5", leadId: "l5", partnerId: "u-admin", client: "SmileDent", service: "Лендинг", amount: 1000, paid: true, closedAt: "2026-06-15" },
  ];

  dealSpecs.forEach((spec) => {
    const closedCount = dealSpecs.filter(
      (d) => d.partnerId === spec.partnerId && d.paid && d.id <= spec.id
    ).length - (spec.paid ? 0 : 1);
    const calc = calculateCommission(spec.amount, Math.max(0, closedCount - 1), settings);
    const deal: Deal = {
      id: spec.id,
      leadId: spec.leadId,
      partnerId: spec.partnerId,
      clientName: spec.client,
      serviceType: spec.service,
      amount: spec.amount,
      currency: "USD",
      commissionPercent: calc.percent,
      commissionAmount: calc.amount,
      partnerClosedDealsCountAtMoment: Math.max(0, closedCount - 1),
      bonusApplied: calc.hasBonus,
      paymentStatus: spec.paid ? "paid" : "waiting_payment",
      commissionStatus: spec.paid ? "accrued" : "not_accrued",
      closedAt: spec.closedAt,
      paidAt: spec.paid ? spec.closedAt : null,
      notes: "",
      createdAt: spec.closedAt,
      updatedAt: spec.closedAt,
    };
    deals.push(deal);

    if (spec.paid) {
      balanceTransactions.push({
        id: `bt-${spec.id}`,
        partnerId: spec.partnerId,
        dealId: spec.id,
        payoutId: null,
        type: "accrual",
        amount: calc.amount,
        currency: "USD",
        status: "completed",
        description: `Комиссия за ${spec.client}`,
        createdBy: "u-admin",
        createdAt: spec.closedAt,
      });
    }
  });

  payouts.push(
    {
      id: "pay1",
      partnerId: "u-artem",
      amount: 325,
      currency: "USD",
      status: "paid",
      paymentMethod: "USDT",
      paymentDetails: "TRC20",
      adminComment: "Комиссия за FitZone",
      paidAt: "2026-06-01",
      createdAt: "2026-06-01",
    },
    {
      id: "pay2",
      partnerId: "u-admin",
      amount: 100,
      currency: "USD",
      status: "paid",
      paymentMethod: "Банк",
      paymentDetails: "—",
      adminComment: "SmileDent",
      paidAt: "2026-06-05",
      createdAt: "2026-06-05",
    }
  );

  balanceTransactions.push(
    {
      id: "bt-pay1",
      partnerId: "u-artem",
      dealId: null,
      payoutId: "pay1",
      type: "payout",
      amount: 325,
      currency: "USD",
      status: "completed",
      description: "Выплата USDT",
      createdBy: "u-admin",
      createdAt: "2026-06-01",
    },
    {
      id: "bt-pay2",
      partnerId: "u-admin",
      dealId: null,
      payoutId: "pay2",
      type: "payout",
      amount: 100,
      currency: "USD",
      status: "completed",
      description: "Выплата на счёт",
      createdBy: "u-admin",
      createdAt: "2026-06-05",
    }
  );

  const leadActivities: LeadActivity[] = [
    act("a1", "l1", "u-andrey", "lead_created", "Партнёр добавил клиента из Instagram"),
    act("a2", "l4", "u-artem", "contacted", "Партнёр написал клиенту"),
    act("a3", "l4", "u-artem", "replied", "Клиент ответил"),
    act("a4", "l4", "u-admin", "sent_to_team", "Передано менеджеру TIVONIX"),
    act("a5", "l5", "u-admin", "offer_sent", "КП отправлено"),
    act("a6", "l7", "u-admin", "won", "Сделка закрыта"),
    act("a7", "l11", "u-admin", "duplicate", "Отмечен как дубль"),
  ];

  const { prospectContacts, prospectActivities } = createSeedProspects();
  const partnerProfiles = createSeedPartnerProfiles();

  return {
    users,
    leads,
    leadActivities,
    deals,
    balanceTransactions,
    payouts,
    commissionSettings: settings,
    prospectContacts,
    prospectActivities,
    partnerProfiles,
  };
}

function mkLead(
  id: string,
  businessName: string,
  niche: string,
  city: string,
  partnerId: string,
  status: Lead["status"],
  adminReview: Lead["adminReviewStatus"],
  createdAt: string,
  contacts: { ig?: string; tg?: string; phone?: string; web?: string }
): Lead {
  return {
    id,
    businessName,
    niche,
    city,
    contactName: "Контакт",
    email: "",
    instagramUrl: contacts.ig ?? "",
    telegramUsername: contacts.tg ?? "",
    phone: contacts.phone ?? "",
    website: contacts.web ?? "",
    source: contacts.ig ? "Instagram" : contacts.tg ? "Telegram" : "Сайт",
    serviceType: "Лендинг",
    estimatedBudget: 1000,
    status,
    priority: "normal",
    partnerId,
    assignedManagerId: partnerId === "u-maxim" ? "u-maxim" : null,
    adminReviewStatus: adminReview,
    adminReviewComment: adminReview === "duplicate" ? "Дубль — уже есть в базе" : "",
    nextAction: status === "pending_review" ? "Ожидает проверки админом" : "В работе",
    lastContactAt: null,
    reservedUntil: null,
    notes: "",
    createdAt,
    updatedAt: createdAt,
  };
}

function act(
  id: string,
  leadId: string,
  userId: string,
  actionType: string,
  comment: string
): LeadActivity {
  return {
    id,
    leadId,
    userId,
    actionType,
    comment,
    oldValue: "",
    newValue: "",
    createdAt: now(),
  };
}

export function getSeedData(): AppData {
  return createSeedData();
}

export { createSeedData };
