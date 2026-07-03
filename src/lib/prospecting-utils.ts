import type { AppData, Lead } from "./types";
import type {
  ProspectContact,
  ProspectDuplicateMatch,
  ProspectStatus,
} from "./prospecting-types";
import { findDuplicateLead } from "./analytics";
import { exportToExcel } from "./export";
import {
  mapProspectForExport,
  PROSPECT_EXPORT_COLUMNS,
} from "./export-columns";
import { MESSAGE_TEMPLATES, CONSTRUCTION_TEMPLATES } from "./academy-data";
import { normalizeWebsite } from "./lead-input-utils";

export function filterProspectsForUser(prospects: ProspectContact[], userId: string, role: string) {
  if (role === "admin" || role === "manager") return prospects;
  return prospects.filter((p) => p.createdBy === userId);
}

export function normalizeProspectInput(value: string): string {
  if (!value) return "";
  const v = value.toLowerCase().trim();
  if (v.includes(".") && (v.includes("http") || v.includes("www"))) {
    return normalizeWebsite(v);
  }
  return v.replace(/^@/, "");
}

export function checkProspectDuplicate(
  data: AppData,
  input: {
    businessName?: string;
    website?: string;
    instagram?: string;
    telegram?: string;
    phone?: string;
    email?: string;
  },
  excludeProspectId?: string
): ProspectDuplicateMatch | null {
  const leadMatch = findDuplicateLead(data, {
    businessName: input.businessName ?? "",
    website: input.website ?? "",
    instagramUrl: input.instagram ?? "",
    telegramUsername: input.telegram ?? "",
    phone: input.phone ?? "",
    email: input.email ?? "",
  });

  if (leadMatch) {
    const lead = leadMatch.lead;
    const user = data.users.find((u) => u.id === lead.partnerId);
    return {
      type: "lead",
      id: lead.id,
      businessName: lead.businessName,
      status: lead.status,
      createdBy: user?.name ?? lead.partnerId,
      createdAt: lead.createdAt,
      matchedField: leadMatch.matchedField,
    };
  }

  for (const p of data.prospectContacts ?? []) {
    if (excludeProspectId && p.id === excludeProspectId) continue;

    const checks: [string, string, string][] = [
      [input.website ?? "", p.website, "website"],
      [input.instagram ?? "", p.instagram, "instagram"],
      [input.telegram ?? "", p.telegram, "telegram"],
      [input.phone ?? "", p.phone, "phone"],
      [input.email ?? "", p.email, "email"],
      [input.businessName ?? "", p.businessName, "businessName"],
    ];

    for (const [a, b, field] of checks) {
      const na = normalizeProspectInput(a);
      const nb = normalizeProspectInput(b);
      if (na && nb && na === nb) {
        const user = data.users.find((u) => u.id === p.createdBy);
        return {
          type: "prospect",
          id: p.id,
          businessName: p.businessName,
          status: p.status,
          createdBy: user?.name ?? p.createdBy,
          createdAt: p.createdAt,
          matchedField: field,
        };
      }
    }
  }

  return null;
}

export function parseBulkProspectLines(text: string): Partial<ProspectContact>[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const [name, niche, city, contact, extra] = parts;

      const draft: Partial<ProspectContact> = {
        businessName: name || line.slice(0, 80),
        niche: niche || "",
        city: city || "",
        source: "Другое",
        website: "",
        instagram: "",
        telegram: "",
        phone: "",
        email: "",
        notes: extra || "",
      };

      const contactField = contact || "";
      if (contactField.includes("instagram.com") || contactField.startsWith("@")) {
        draft.instagram = contactField;
      } else if (contactField.includes("t.me") || contactField.startsWith("@")) {
        draft.telegram = contactField;
      } else if (contactField.startsWith("http")) {
        draft.website = contactField;
      } else if (contactField.includes("@") && contactField.includes(".")) {
        draft.email = contactField;
      } else if (/\+?\d/.test(contactField)) {
        draft.phone = contactField;
      } else if (contactField) {
        draft.notes = [draft.notes, contactField].filter(Boolean).join(" · ");
      }

      return draft;
    });
}

export function inferServiceType(prospect: ProspectContact): string {
  const pain = prospect.painPoints.toLowerCase();
  if (pain.includes("бот")) return "telegram_bot";
  if (pain.includes("crm")) return "crm";
  if (pain.includes("лендинг")) return "landing";
  if (pain.includes("запис")) return "other";
  if (!prospect.hasWebsite || prospect.websiteQuality === "no_website") return "website";
  return "project_rework";
}

export function getNextAction(prospect: ProspectContact): string {
  const today = new Date().toISOString().slice(0, 10);
  if (prospect.status === "converted_to_lead") return "В CRM";
  if (prospect.status === "duplicate" || prospect.status === "do_not_contact") return "—";
  if (prospect.status === "replied") return "Добавить в лиды";
  if (prospect.status === "follow_up_needed" || (prospect.followUpAt && prospect.followUpAt <= today)) {
    return "Повтор сегодня";
  }
  if (prospect.status === "messaged") return "Ждать ответ";
  if (prospect.status === "ready_to_message") return "Написать";
  if (prospect.status === "needs_check") return "Проверить";
  if (prospect.status === "checked") return "Решить";
  return "Проверить сайт";
}

export function getTemplatesForProspect(prospect: ProspectContact) {
  const niche = prospect.niche.toLowerCase();
  const universal = MESSAGE_TEMPLATES.filter((t) =>
    ["first", "no-site", "weak-site", "followup"].includes(t.category)
  );

  if (niche.includes("строит")) {
    return [
      ...CONSTRUCTION_TEMPLATES.map((t, i) => ({
        id: `c-${i}`,
        title: t.title,
        text: t.text,
      })),
      ...universal.slice(0, 3),
    ];
  }
  if (niche.includes("салон") || niche.includes("красот")) {
    return MESSAGE_TEMPLATES.filter(
      (t) => t.tags.some((tag) => ["салон", "красота", "запись"].includes(tag)) || t.category === "first"
    );
  }
  if (niche.includes("авто")) {
    return MESSAGE_TEMPLATES.filter(
      (t) => t.tags.some((tag) => tag.includes("автосервис")) || t.category === "first"
    );
  }
  return universal;
}

export function getTodayProspectingStats(prospects: ProspectContact[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    found: prospects.filter((p) => p.createdAt.slice(0, 10) === today).length,
    checked: prospects.filter(
      (p) => p.updatedAt.slice(0, 10) === today && ["checked", "ready_to_message"].includes(p.status)
    ).length,
    messaged: prospects.filter((p) => p.firstMessageSentAt?.slice(0, 10) === today).length,
    replied: prospects.filter(
      (p) => p.status === "replied" && p.updatedAt.slice(0, 10) === today
    ).length,
  };
}

export function getProspectStatsCounts(prospects: ProspectContact[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: prospects.length,
    unchecked: prospects.filter((p) => ["new", "needs_check"].includes(p.status)).length,
    checked: prospects.filter((p) => p.status === "checked").length,
    messaged: prospects.filter((p) => p.status === "messaged").length,
    followUp: prospects.filter(
      (p) =>
        p.status === "follow_up_needed" ||
        (p.followUpAt && p.followUpAt <= today && p.status === "messaged")
    ).length,
    replied: prospects.filter((p) => p.status === "replied").length,
    converted: prospects.filter((p) => p.status === "converted_to_lead").length,
    bad: prospects.filter((p) =>
      ["duplicate", "not_relevant", "do_not_contact"].includes(p.status)
    ).length,
  };
}

export async function exportProspectsToCSV(prospects: ProspectContact[]) {
  await exportToExcel(
    prospects.map(mapProspectForExport),
    "poisk-klientov",
    PROSPECT_EXPORT_COLUMNS,
    { sheetName: "Поиск клиентов" }
  );
}

export function addFollowUpDays(days = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function prospectToLeadInput(
  prospect: ProspectContact,
  partnerId: string
): Omit<Lead, "id" | "createdAt" | "updatedAt"> {
  return {
    businessName: prospect.businessName,
    niche: prospect.niche,
    city: prospect.city,
    contactName: prospect.contactPerson,
    email: prospect.email,
    instagramUrl: prospect.instagram,
    telegramUsername: prospect.telegram,
    phone: prospect.phone,
    website: prospect.website,
    source: prospect.source,
    serviceType: inferServiceType(prospect),
    estimatedBudget: 0,
    status: "pending_review",
    priority: prospect.priority === "high" ? "high" : prospect.priority === "low" ? "low" : "normal",
    partnerId,
    assignedManagerId: null,
    adminReviewStatus: "pending",
    adminReviewComment: "",
    nextAction: "Ожидает проверки админа",
    lastContactAt: prospect.firstMessageSentAt,
    reservedUntil: null,
    notes: [prospect.notes, prospect.painPoints].filter(Boolean).join("\n"),
  };
}

export function filterProspects(
  prospects: ProspectContact[],
  filters: {
    search?: string;
    status?: string;
    niche?: string;
    source?: string;
    city?: string;
    priority?: string;
    followUpToday?: boolean;
    noWebsite?: boolean;
    badWebsite?: boolean;
  }
) {
  const today = new Date().toISOString().slice(0, 10);
  return prospects.filter((p) => {
    if (filters.status && filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.niche && filters.niche !== "all" && p.niche !== filters.niche) return false;
    if (filters.source && filters.source !== "all" && p.source !== filters.source) return false;
    if (filters.city && filters.city !== "all" && p.city !== filters.city) return false;
    if (filters.priority && filters.priority !== "all" && p.priority !== filters.priority) return false;
    if (filters.followUpToday) {
      const needs =
        p.status === "follow_up_needed" ||
        (p.followUpAt && p.followUpAt <= today && ["messaged", "follow_up_needed"].includes(p.status));
      if (!needs) return false;
    }
    if (filters.noWebsite && p.hasWebsite !== false && p.websiteQuality !== "no_website") return false;
    if (filters.badWebsite && p.websiteQuality !== "bad") return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = [
        p.businessName,
        p.website,
        p.instagram,
        p.telegram,
        p.phone,
        p.email,
        p.notes,
        p.niche,
        p.city,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function emptyProspect(partial: Partial<ProspectContact>, userId: string): Omit<ProspectContact, "id" | "createdAt" | "updatedAt"> {
  const ts = new Date().toISOString().slice(0, 10);
  return {
    businessName: partial.businessName ?? "",
    niche: partial.niche ?? "",
    city: partial.city ?? "",
    source: partial.source ?? "Другое",
    website: partial.website ?? "",
    instagram: partial.instagram ?? "",
    telegram: partial.telegram ?? "",
    phone: partial.phone ?? "",
    email: partial.email ?? "",
    contactPerson: partial.contactPerson ?? "",
    status: (partial.status as ProspectStatus) ?? "new",
    priority: partial.priority ?? "medium",
    websiteQuality: partial.websiteQuality ?? "unknown",
    hasWebsite: partial.hasWebsite ?? null,
    hasOnlineBooking: partial.hasOnlineBooking ?? false,
    hasTelegramBot: partial.hasTelegramBot ?? false,
    hasCRM: partial.hasCRM ?? false,
    painPoints: partial.painPoints ?? "",
    messageTemplateUsed: partial.messageTemplateUsed ?? "",
    firstMessageSentAt: partial.firstMessageSentAt ?? null,
    followUpAt: partial.followUpAt ?? null,
    followUpSent: partial.followUpSent ?? false,
    lastActionAt: partial.lastActionAt ?? ts,
    notes: partial.notes ?? "",
    duplicateLeadId: partial.duplicateLeadId ?? null,
    convertedLeadId: partial.convertedLeadId ?? null,
    createdBy: userId,
  };
}
