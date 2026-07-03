"use client";

import { useEffect, useRef } from "react";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { LeadPartnerView } from "@/components/leads/lead-partner-view";
import { LeadAdminActions } from "@/components/leads/lead-admin-actions";
import { LeadDataTable } from "@/components/leads/lead-data-table";
import { LeadStatusHero } from "@/components/leads/lead-status-hero";
import { useCan } from "@/components/access/role-guard";
import { useApp, useCurrentUser } from "@/lib/store";
import { filterLeadsForUser, isPartner } from "@/lib/access";
import { getLeadStatusLabel, DEAL_PAYMENT_LABELS } from "@/lib/statuses";
import { getUserName, getDealForLead, getPartnerClosedDealsCount } from "@/lib/analytics";
import { formatCurrency } from "@/lib/commission";
import { formatDate } from "@/lib/utils";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { toast } from "sonner";
import { getServiceTypeLabel, toServiceTypeSlug } from "@/lib/service-types";
import { toUserMessage } from "@/lib/errors";

interface LeadDetailContentProps {
  leadId: string;
}

export function LeadDetailContent({ leadId }: LeadDetailContentProps) {
  const {
    data,
    approveLead,
    rejectLead,
    markDuplicate,
    markDoNotContact,
    updateLead,
    createDeal,
    updateDeal,
    ensureDealForLead,
    assignManager,
    getUserById,
  } = useApp();
  const user = useCurrentUser();
  const canApprove = useCan("approve_lead");
  const partnerView = isPartner(user);
  const ensureStarted = useRef(false);

  const lead = data.leads.find((l) => l.id === leadId);
  const deal = lead ? getDealForLead(data, leadId) : undefined;

  useEffect(() => {
    if (!lead || !canApprove || lead.status !== "won" || deal || ensureStarted.current) return;
    ensureStarted.current = true;
    void ensureDealForLead(leadId, user.id).catch(() => {
      ensureStarted.current = false;
    });
  }, [canApprove, deal, ensureDealForLead, lead, leadId, user.id]);

  if (!lead) {
    return (
      <p className="py-12 text-center text-sm text-[#6b7280]">{CLIENT_COPY.notFoundOne}</p>
    );
  }

  const visible = filterLeadsForUser([lead], user);
  if (visible.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#6b7280]">{CLIENT_COPY.noAccess}</p>
    );
  }

  const activities = data.leadActivities.filter((a) => a.leadId === leadId);
  const partner = getUserById(lead.partnerId);
  const closedCount = getPartnerClosedDealsCount(data, lead.partnerId);

  return (
    <div className="space-y-8">
      {partnerView ? (
        <LeadPartnerView lead={lead} deal={deal} />
      ) : (
        <>
          <LeadStatusHero lead={lead} />

          <LeadDataTable
            rows={[
              { label: "Бизнес", value: lead.businessName },
              { label: "Сфера", value: lead.niche },
              { label: "Город", value: lead.city },
              { label: "Услуга", value: lead.serviceType },
              { label: "Бюджет", value: formatCurrency(lead.estimatedBudget) },
              { label: "Источник", value: lead.source },
              { label: "Партнёр", value: partner?.name ?? "—" },
              {
                label: "Менеджер",
                value: lead.assignedManagerId ? getUserName(data, lead.assignedManagerId) : "—",
              },
              { label: "Имя", value: lead.contactName, hidden: !lead.contactName },
              { label: "Email", value: lead.email, hidden: !lead.email },
              { label: "Telegram", value: lead.telegramUsername, hidden: !lead.telegramUsername },
              { label: "Instagram", value: lead.instagramUrl, hidden: !lead.instagramUrl },
              { label: "Телефон", value: lead.phone, hidden: !lead.phone },
              { label: "Сайт", value: lead.website, hidden: !lead.website },
              { label: "Дата добавления", value: formatDate(lead.createdAt) },
              {
                label: "Комментарий",
                value: lead.adminReviewComment,
                hidden: !lead.adminReviewComment,
              },
              {
                label: "Сделка",
                value: deal
                  ? `${deal.clientName} — ${formatCurrency(deal.amount)} · комиссия ${formatCurrency(deal.commissionAmount)}`
                  : undefined,
                hidden: !deal,
              },
              {
                label: "Статус оплаты",
                value: deal ? DEAL_PAYMENT_LABELS[deal.paymentStatus] : undefined,
                hidden: !deal,
              },
              { label: "Заметки", value: lead.notes, hidden: !lead.notes },
            ]}
          />

          {canApprove && (
            <LeadAdminActions
              lead={lead}
              deal={deal}
              users={data.users}
              commissionSettings={data.commissionSettings}
              partnerClosedDealsCount={closedCount}
              onApprove={(comment) => approveLead(leadId, user.id, comment)}
              onReject={(comment) => rejectLead(leadId, user.id, comment)}
              onDuplicate={(comment) => markDuplicate(leadId, user.id, comment)}
              onDoNotContact={() => markDoNotContact(leadId, user.id)}
              onStatusChange={(status, comment) =>
                updateLead(leadId, { status }, user.id, comment || `Статус: ${getLeadStatusLabel(status)}`)
              }
              onAssignManager={(managerId) => assignManager(leadId, managerId, user.id)}
              onCreateDeal={async (d) => {
                try {
                  await createDeal({
                    leadId,
                    clientName: lead.businessName,
                    serviceType: getServiceTypeLabel(toServiceTypeSlug(d.serviceType || lead.serviceType)),
                    amount: d.amount,
                    currency: "USD",
                    paymentStatus: d.paymentStatus,
                    notes: d.notes,
                    createdBy: user.id,
                  });
                  if (d.paymentStatus === "paid" || d.paymentStatus === "waiting_payment") {
                    await updateLead(leadId, { status: "won" }, user.id, "Сделка создана");
                  }
                  toast.success("Сделка создана");
                } catch (error) {
                  toast.error(toUserMessage(error, "Не удалось создать сделку"));
                  throw error;
                }
              }}
              onUpdateDeal={deal ? async (d) => {
                try {
                  await updateDeal(deal.id, {
                    amount: d.amount,
                    serviceType: d.serviceType,
                    notes: d.notes,
                  }, user.id);
                } catch (error) {
                  toast.error(toUserMessage(error, "Не удалось обновить сделку"));
                  throw error;
                }
              } : undefined}
            />
          )}
        </>
      )}

      <section className="rounded-2xl bg-[#f6f6f6] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#050505]">История действий</h2>
        <ActivityTimeline activities={activities} users={data.users} />
      </section>
    </div>
  );
}
