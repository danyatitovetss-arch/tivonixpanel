"use client";

import type { Lead, Deal } from "@/lib/types";
import { LeadStatusHero } from "@/components/leads/lead-status-hero";
import { LeadDataTable } from "@/components/leads/lead-data-table";
import { DEAL_PAYMENT_LABELS } from "@/lib/statuses";
import { formatCurrency } from "@/lib/commission";
import { formatDate } from "@/lib/utils";

interface LeadPartnerViewProps {
  lead: Lead;
  deal?: Deal;
}

export function LeadPartnerView({ lead, deal }: LeadPartnerViewProps) {
  return (
    <div className="space-y-6">
      <LeadStatusHero lead={lead} />

      <LeadDataTable
        rows={[
          { label: "Бизнес", value: lead.businessName },
          { label: "Сфера", value: lead.niche },
          { label: "Город", value: lead.city },
          { label: "Услуга", value: lead.serviceType },
          { label: "Бюджет", value: formatCurrency(lead.estimatedBudget) },
          { label: "Источник", value: lead.source },
          { label: "Имя", value: lead.contactName, hidden: !lead.contactName },
          { label: "Email", value: lead.email, hidden: !lead.email },
          { label: "Telegram", value: lead.telegramUsername, hidden: !lead.telegramUsername },
          { label: "Instagram", value: lead.instagramUrl, hidden: !lead.instagramUrl },
          { label: "Телефон", value: lead.phone, hidden: !lead.phone },
          { label: "Сайт", value: lead.website, hidden: !lead.website },
          { label: "Дата добавления", value: formatDate(lead.createdAt) },
          {
            label: "Комментарий TIVONIX",
            value: lead.adminReviewComment,
            hidden: !lead.adminReviewComment,
          },
          {
            label: "Сумма сделки",
            value: deal ? formatCurrency(deal.amount, deal.currency) : undefined,
            hidden: !deal,
          },
          {
            label: "Статус оплаты",
            value: deal ? DEAL_PAYMENT_LABELS[deal.paymentStatus] : undefined,
            hidden: !deal,
          },
          {
            label: "Комиссия",
            value: deal?.paymentStatus === "paid"
              ? `${formatCurrency(deal.commissionAmount, deal.currency)} (${deal.commissionPercent}%)`
              : deal
                ? "После подтверждения оплаты"
                : undefined,
            hidden: !deal,
          },
          { label: "Заметки", value: lead.notes, hidden: !lead.notes },
        ]}
      />
    </div>
  );
}
