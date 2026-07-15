import type { AppData, Lead, Deal } from "./types";
import { getLeadStatusLabel } from "./statuses";
import { formatCurrency } from "./commission";

export interface DashboardStats {
  totalLeads: number;
  pendingReview: number;
  approved: number;
  inProgress: number;
  closedDeals: number;
  salesAmount: number;
  commissionAccrued: number;
  commissionToPay: number;
}

export interface AttentionItem {
  id: string;
  type: "lead_review" | "deal_payment" | "commission_payout" | "duplicate";
  title: string;
  subtitle: string;
  href: string;
}

export function getDashboardStats(data: AppData, partnerId?: string): DashboardStats {
  const leads = partnerId
    ? data.leads.filter((l) => l.partnerId === partnerId)
    : data.leads;
  const deals = partnerId
    ? data.deals.filter((d) => d.partnerId === partnerId)
    : data.deals;

  const paidDeals = deals.filter((d) => d.paymentStatus === "paid");
  const accruedTx = data.balanceTransactions.filter(
    (t) =>
      t.type === "accrual" &&
      t.status === "completed" &&
      (!partnerId || t.partnerId === partnerId)
  );
  const payoutTx = data.balanceTransactions.filter(
    (t) =>
      t.type === "payout" &&
      t.status === "completed" &&
      (!partnerId || t.partnerId === partnerId)
  );

  const commissionAccrued = accruedTx.reduce((s, t) => s + t.amount, 0);
  const commissionPaid = payoutTx.reduce((s, t) => s + t.amount, 0);

  return {
    totalLeads: leads.length,
    pendingReview: leads.filter((l) => l.status === "pending_review").length,
    approved: leads.filter((l) => l.status === "approved").length,
    inProgress: leads.filter((l) =>
      ["contacted", "replied", "interested", "sent_to_team", "offer_sent"].includes(l.status)
    ).length,
    closedDeals: paidDeals.length,
    salesAmount: paidDeals.reduce((s, d) => s + d.amount, 0),
    commissionAccrued,
    commissionToPay: commissionAccrued - commissionPaid,
  };
}

export function getAttentionItems(data: AppData): AttentionItem[] {
  const items: AttentionItem[] = [];

  data.leads
    .filter((l) => l.status === "pending_review")
    .slice(0, 5)
    .forEach((l) => {
      items.push({
        id: `review-${l.id}`,
        type: "lead_review",
        title: l.businessName,
        subtitle: "Клиент ожидает проверки",
        href: `/leads/${l.id}`,
      });
    });

  data.deals
    .filter((d) => d.paymentStatus === "waiting_payment")
    .slice(0, 3)
    .forEach((d) => {
      items.push({
        id: `deal-${d.id}`,
        type: "deal_payment",
        title: d.clientName,
        subtitle: "Сделка ожидает оплаты",
        href: `/deals`,
      });
    });

  const balances = getPartnersWithBalance(data);
  balances.slice(0, 3).forEach(({ partnerId, balance }) => {
    const user = data.users.find((u) => u.id === partnerId);
    if (balance > 0) {
      items.push({
        id: `balance-${partnerId}`,
        type: "commission_payout",
        title: user?.name ?? partnerId,
        subtitle: `К выплате: ${formatCurrency(balance)}`,
        href: `/payouts`,
      });
    }
  });

  return items;
}

export function getPartnerBalance(data: AppData, partnerId: string): number {
  const completed = data.balanceTransactions.filter(
    (t) => t.partnerId === partnerId && t.status === "completed"
  );
  const accruals = completed
    .filter((t) => t.type === "accrual")
    .reduce((s, t) => s + t.amount, 0);
  const payouts = completed
    .filter((t) => t.type === "payout")
    .reduce((s, t) => s + t.amount, 0);
  const corrections = completed
    .filter((t) => t.type === "correction")
    .reduce((s, t) => s + t.amount, 0);
  const cancellations = completed
    .filter((t) => t.type === "cancellation")
    .reduce((s, t) => s + t.amount, 0);
  return accruals - payouts + corrections - cancellations;
}

export function getPartnersWithBalance(data: AppData): { partnerId: string; balance: number }[] {
  return data.users
    .filter((u) => u.role === "partner")
    .map((u) => ({ partnerId: u.id, balance: getPartnerBalance(data, u.id) }))
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance);
}

export function getPartnerStats(data: AppData, partnerId: string) {
  const leads = data.leads.filter((l) => l.partnerId === partnerId);
  const deals = data.deals.filter((d) => d.partnerId === partnerId);
  const paidDeals = deals.filter((d) => d.paymentStatus === "paid");

  return {
    totalLeads: leads.length,
    pendingReview: leads.filter((l) => l.status === "pending_review").length,
    approved: leads.filter((l) => l.status === "approved").length,
    replied: leads.filter((l) =>
      ["replied", "interested", "sent_to_team", "offer_sent"].includes(l.status)
    ).length,
    closedDeals: paidDeals.length,
    salesAmount: paidDeals.reduce((s, d) => s + d.amount, 0),
    commissionAccrued: paidDeals
      .filter((d) => d.commissionStatus !== "cancelled")
      .reduce((s, d) => s + d.commissionAmount, 0),
    balance: getPartnerBalance(data, partnerId),
  };
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export interface PartnerMonthlyTrends {
  balance: number;
  leads: number;
  closedDeals: number;
  commission: number;
}

export function getPartnerMonthlyTrends(data: AppData, partnerId: string): PartnerMonthlyTrends {
  const now = new Date();
  const thisMonth = monthKey(now);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(prev);

  const leads = data.leads.filter((l) => l.partnerId === partnerId);
  const leadsThisMonth = leads.filter((l) => l.createdAt.startsWith(thisMonth)).length;
  const leadsLastMonth = leads.filter((l) => l.createdAt.startsWith(lastMonth)).length;

  const paidDeals = data.deals.filter(
    (d) => d.partnerId === partnerId && d.paymentStatus === "paid"
  );
  const dealsThisMonth = paidDeals.filter((d) => d.closedAt.startsWith(thisMonth)).length;
  const dealsLastMonth = paidDeals.filter((d) => d.closedAt.startsWith(lastMonth)).length;

  const accruals = data.balanceTransactions.filter(
    (t) => t.partnerId === partnerId && t.type === "accrual" && t.status === "completed"
  );
  const commissionThisMonth = accruals
    .filter((t) => t.createdAt.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0);
  const commissionLastMonth = accruals
    .filter((t) => t.createdAt.startsWith(lastMonth))
    .reduce((s, t) => s + t.amount, 0);

  const payoutsThisMonth = data.balanceTransactions
    .filter(
      (t) =>
        t.partnerId === partnerId &&
        t.type === "payout" &&
        t.status === "completed" &&
        t.createdAt.startsWith(thisMonth)
    )
    .reduce((s, t) => s + t.amount, 0);
  const payoutsLastMonth = data.balanceTransactions
    .filter(
      (t) =>
        t.partnerId === partnerId &&
        t.type === "payout" &&
        t.status === "completed" &&
        t.createdAt.startsWith(lastMonth)
    )
    .reduce((s, t) => s + t.amount, 0);

  return {
    balance: percentChange(commissionThisMonth - payoutsThisMonth, commissionLastMonth - payoutsLastMonth),
    leads: percentChange(leadsThisMonth, leadsLastMonth),
    closedDeals: percentChange(dealsThisMonth, dealsLastMonth),
    commission: percentChange(commissionThisMonth, commissionLastMonth),
  };
}

export function getLeadsByDay(data: AppData, days = 14, partnerId?: string) {
  const leads = partnerId
    ? data.leads.filter((l) => l.partnerId === partnerId)
    : data.leads;
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = leads.filter((l) => l.createdAt.startsWith(key)).length;
    result.push({
      date: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      count,
    });
  }
  return result;
}

export function getDealsByMonth(data: AppData, partnerId?: string, months = 6) {
  const map = new Map<string, number>();
  data.deals
    .filter((d) => d.paymentStatus === "paid" && (!partnerId || d.partnerId === partnerId))
    .forEach((d) => {
      const key = d.closedAt.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
  return fillLastMonths(map, months).map(({ month, value }) => ({
    month: formatMonth(month),
    count: value,
  }));
}

export function getSalesByMonth(data: AppData, partnerId?: string, months = 6) {
  const map = new Map<string, number>();
  data.deals
    .filter((d) => d.paymentStatus === "paid" && (!partnerId || d.partnerId === partnerId))
    .forEach((d) => {
      const key = d.closedAt.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + d.amount);
    });
  return fillLastMonths(map, months).map(({ month, value }) => ({
    month: formatMonth(month),
    amount: value,
  }));
}

export function getCommissionsByMonth(data: AppData, partnerId?: string, months = 6) {
  const map = new Map<string, number>();
  data.balanceTransactions
    .filter(
      (t) =>
        t.type === "accrual" &&
        t.status === "completed" &&
        (!partnerId || t.partnerId === partnerId)
    )
    .forEach((t) => {
      const key = t.createdAt.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + t.amount);
    });
  return fillLastMonths(map, months).map(({ month, value }) => ({
    month: formatMonth(month),
    amount: value,
  }));
}

export function getConversionFunnel(data: AppData, partnerId?: string) {
  const leads = partnerId
    ? data.leads.filter((l) => l.partnerId === partnerId)
    : data.leads;
  const deals = partnerId
    ? data.deals.filter((d) => d.partnerId === partnerId)
    : data.deals;
  return [
    { stage: "Добавлено", count: leads.length },
    {
      stage: "Одобрено",
      count: leads.filter((l) =>
        !["pending_review", "rejected", "duplicate"].includes(l.status)
      ).length,
    },
    {
      stage: "Ответили",
      count: leads.filter((l) =>
        ["replied", "interested", "sent_to_team", "offer_sent", "won"].includes(l.status)
      ).length,
    },
    {
      stage: "КП отправлено",
      count: leads.filter((l) =>
        ["offer_sent", "won"].includes(l.status)
      ).length,
    },
    {
      stage: "Оплачено",
      count: deals.filter((d) => d.paymentStatus === "paid").length,
    },
  ];
}

export function getTopPartners(data: AppData) {
  return data.users
    .filter((u) => u.role === "partner")
    .map((u) => ({
      name: u.name,
      deals: data.deals.filter((d) => d.partnerId === u.id && d.paymentStatus === "paid").length,
    }))
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 6);
}

export function getTopSources(data: AppData) {
  const map = new Map<string, number>();
  data.leads.forEach((l) => {
    map.set(l.source, (map.get(l.source) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));
}

export function getTopServicesByRevenue(data: AppData) {
  const map = new Map<string, number>();
  data.deals
    .filter((d) => d.paymentStatus === "paid")
    .forEach((d) => {
      map.set(d.serviceType, (map.get(d.serviceType) ?? 0) + d.amount);
    });
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([service, revenue]) => ({ service, revenue }));
}

export function getLeadsByStatus(data: AppData) {
  const counts = new Map<string, number>();
  data.leads.forEach((l) => {
    const label = getLeadStatusLabel(l.status);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

export function getPartnerClosedDealsCount(data: AppData, partnerId: string): number {
  return data.deals.filter(
    (d) => d.partnerId === partnerId && d.paymentStatus === "paid"
  ).length;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
}

function fillLastMonths(map: Map<string, number>, months: number) {
  const now = new Date();
  const result: { month: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    result.push({ month: key, value: map.get(key) ?? 0 });
  }
  return result;
}

export function findDuplicateLead(
  data: AppData,
  input: {
    instagramUrl?: string;
    telegramUsername?: string;
    phone?: string;
    website?: string;
    businessName?: string;
    email?: string;
  },
  excludeId?: string
): { lead: Lead; matchedField: string } | null {
  const normPhone = (p: string) => {
    let d = p.replace(/\D/g, "");
    if (d.length === 11 && d.startsWith("8")) d = `7${d.slice(1)}`;
    return d;
  };
  const normTg = (t: string) => t.toLowerCase().replace(/^@/, "").trim();
  const normIg = (i: string) => {
    const c = i.toLowerCase().replace(/^@/, "").trim();
    const m = c.match(/instagram\.com\/([^/?]+)/);
    return m ? m[1] : c.replace(/^https?:\/\//, "").replace(/^www\./, "");
  };
  const normWeb = (w: string) =>
    w.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  const normName = (n: string) => n.toLowerCase().trim();
  const normEmail = (e: string) => e.toLowerCase().trim();

  for (const lead of data.leads) {
    if (excludeId && lead.id === excludeId) continue;

    if (input.phone && lead.phone && normPhone(input.phone) === normPhone(lead.phone)) {
      return { lead, matchedField: "телефон" };
    }
    if (
      input.telegramUsername &&
      lead.telegramUsername &&
      normTg(input.telegramUsername) === normTg(lead.telegramUsername)
    ) {
      return { lead, matchedField: "Telegram" };
    }
    if (
      input.instagramUrl &&
      lead.instagramUrl &&
      normIg(input.instagramUrl) === normIg(lead.instagramUrl)
    ) {
      return { lead, matchedField: "Instagram" };
    }
    if (input.website && lead.website && normWeb(input.website) === normWeb(lead.website)) {
      return { lead, matchedField: "сайт" };
    }
    if (input.email && lead.email && normEmail(input.email) === normEmail(lead.email)) {
      return { lead, matchedField: "email" };
    }
    if (
      input.businessName &&
      lead.businessName &&
      normName(input.businessName) === normName(lead.businessName)
    ) {
      return { lead, matchedField: "название бизнеса" };
    }
  }
  return null;
}

export function getUserName(data: AppData, userId: string): string {
  return data.users.find((u) => u.id === userId)?.name ?? "—";
}

export function getDealForLead(data: AppData, leadId: string): Deal | undefined {
  return data.deals.find((d) => d.leadId === leadId);
}
