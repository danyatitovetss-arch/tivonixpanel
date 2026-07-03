"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { BalanceCard } from "@/components/finance/balance-card";
import { ExportButton } from "@/components/common/export-button";
import { MY_LEADS_EXPORT_COLUMNS, formatExportDate } from "@/lib/export-columns";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import { OkxPageTitle, OkxTable, OkxTableBody, OkxTr, OkxTd, OkxCellPrimary } from "@/components/ui/okx-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { useAppData, useCurrentUser } from "@/lib/store";
import { getPartnerStats, getPartnerBalance } from "@/lib/analytics";
import { getLeadStatusLabel, ADMIN_REVIEW_LABELS } from "@/lib/statuses";
import { formatCurrency } from "@/lib/commission";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { RoleGuard } from "@/components/access/role-guard";

export default function MyPage() {
  const data = useAppData();
  const user = useCurrentUser();
  const { open: openAddLead } = useAddLeadSheet();
  const { openLead } = useLeadDetail();
  const stats = getPartnerStats(data, user.id);
  const balance = getPartnerBalance(data, user.id);
  const myLeads = data.leads.filter((l) => l.partnerId === user.id).slice(0, 5);
  const myDeals = data.deals.filter((d) => d.partnerId === user.id);
  const myPayouts = data.payouts.filter((p) => p.partnerId === user.id);

  const exportData = data.leads
    .filter((l) => l.partnerId === user.id)
    .map((l) => ({
      business: l.businessName,
      status: getLeadStatusLabel(l.status),
      budget: l.estimatedBudget,
      created: formatExportDate(l.createdAt),
    }));

  return (
    <RoleGuard resource="leads" redirectTo="/dashboard">
      <AppLayout title="Мой кабинет" showAddLead={false} showSearch={false}>
        <div className="space-y-10">
          <OkxPageTitle
            title={`Привет, ${user.name}`}
            description={CLIENT_COPY.descriptionMy}
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <BalanceCard label="Баланс к выплате" amount={balance} />
            <BalanceCard label={CLIENT_COPY.titleMy} amount={stats.totalLeads} />
            <BalanceCard label="Закрытые сделки" amount={stats.closedDeals} />
            <BalanceCard label="Начислено комиссии" amount={stats.commissionAccrued} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAddLead}
              className="inline-flex h-10 items-center rounded-full bg-[#050505] px-5 text-sm font-medium text-white"
            >
              {CLIENT_COPY.add}
            </button>
            <ExportButton
              data={exportData}
              filename="moi-klienty"
              columns={MY_LEADS_EXPORT_COLUMNS}
              sheetName="Мои клиенты"
            />
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-[#050505]">{CLIENT_COPY.titleMy}</h2>
            {myLeads.length === 0 ? (
              <EmptyState title={CLIENT_COPY.notFound} />
            ) : (
              <>
                <div className="hidden sm:block">
                  <OkxTable>
                    <OkxTableBody>
                      {myLeads.map((l) => (
                        <OkxTr key={l.id} className="cursor-pointer" onClick={() => openLead(l.id)}>
                          <OkxTd>
                            <OkxCellPrimary title={l.businessName} subtitle={l.niche} />
                          </OkxTd>
                          <OkxTd>
                            <StatusBadge status={l.status} label={getLeadStatusLabel(l.status)} />
                          </OkxTd>
                          <OkxTd className="text-[#6b7280]">{l.adminReviewComment || ADMIN_REVIEW_LABELS[l.adminReviewStatus]}</OkxTd>
                        </OkxTr>
                      ))}
                    </OkxTableBody>
                  </OkxTable>
                </div>
                <div className="space-y-3 sm:hidden">
                  {myLeads.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => openLead(l.id)}
                      className="w-full rounded-2xl bg-[#f6f6f6] p-4 text-left transition-colors hover:bg-[#efefef]"
                    >
                      <p className="font-semibold text-[#050505]">{l.businessName}</p>
                      {l.niche && <p className="mt-0.5 text-xs text-[#6b7280]">{l.niche}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge status={l.status} label={getLeadStatusLabel(l.status)} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-[#050505]">Мои сделки</h2>
            {myDeals.length === 0 ? (
              <EmptyState title="Пока нет" />
            ) : (
              <OkxTable>
                <OkxTableBody>
                  {myDeals.map((d) => (
                    <OkxTr key={d.id}>
                      <OkxTd className="font-medium">{d.clientName}</OkxTd>
                      <OkxTd>{formatCurrency(d.amount, d.currency)}</OkxTd>
                      <OkxTd>{formatCurrency(d.commissionAmount, d.currency)}</OkxTd>
                      <OkxTd className="text-[#6b7280]">{d.paymentStatus}</OkxTd>
                    </OkxTr>
                  ))}
                </OkxTableBody>
              </OkxTable>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-[#050505]">Мои выплаты</h2>
            {myPayouts.length === 0 ? (
              <EmptyState title="Пока нет" />
            ) : (
              <OkxTable>
                <OkxTableBody>
                  {myPayouts.map((p) => (
                    <OkxTr key={p.id}>
                      <OkxTd>{formatCurrency(p.amount, p.currency)}</OkxTd>
                      <OkxTd className="text-[#6b7280]">{p.status}</OkxTd>
                      <OkxTd className="text-[#6b7280]">{p.paidAt ?? "—"}</OkxTd>
                    </OkxTr>
                  ))}
                </OkxTableBody>
              </OkxTable>
            )}
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
