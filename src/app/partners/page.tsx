"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/access/role-guard";
import { BalanceCard } from "@/components/finance/balance-card";
import {
  OkxPageTitle,
  OkxTable,
  OkxTableHead,
  OkxTableBody,
  OkxTh,
  OkxTr,
  OkxTd,
  OkxCellPrimary,
  OkxTableScroll,
} from "@/components/ui/okx-table";
import { useAppData } from "@/lib/store";
import { getPartnerStats, getPartnerBalance } from "@/lib/analytics";
import { formatCurrency } from "@/lib/commission";
import { getUserRoleLabel } from "@/lib/statuses";
import { ChevronRight } from "lucide-react";

export default function PartnersPage() {
  const data = useAppData();
  const partners = data.users.filter((u) => u.role === "partner");

  return (
    <RoleGuard resource="partners" redirectTo="/dashboard">
      <AppLayout title="Партнёры" showAddLead={false}>
        <div className="space-y-8">
          <OkxPageTitle title="Партнёры" description="Статистика и балансы партнёров" />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <BalanceCard label="Всего партнёров" amount={partners.length} format="count" />
            <BalanceCard label="Активные" amount={partners.filter((p) => p.status === "active").length} format="count" />
            <BalanceCard label="Клиентов за месяц" amount={data.leads.filter((l) => l.createdAt >= "2026-06-01").length} format="count" />
            <BalanceCard label="К выплате" amount={partners.reduce((s, p) => s + getPartnerBalance(data, p.id), 0)} />
          </div>

          <div className="space-y-3 md:hidden">
            {partners.map((p) => {
              const stats = getPartnerStats(data, p.id);
              const balance = getPartnerBalance(data, p.id);
              return (
                <Link
                  key={p.id}
                  href={`/partners/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#f4f4f5] p-4 transition-colors hover:bg-[#f4f4f5]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#18181b]">{p.name}</p>
                    <p className="mt-0.5 text-xs text-[#71717a]">
                      {stats.totalLeads} клиентов · {stats.closedDeals} сделок
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#18181b]">
                      Баланс {formatCurrency(balance)}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-[#9ca3af]" />
                </Link>
              );
            })}
          </div>

          <OkxTableScroll className="hidden md:block">
            <OkxTable className="min-w-[900px]">
              <OkxTableHead>
                <OkxTr interactive={false}>
                  {["Партнёр", "Роль", "Клиенты", "На проверке", "Одобрено", "Ответили", "Сделки", "Продажи", "Комиссия", "Баланс"].map(
                    (h) => (
                      <OkxTh key={h}>{h}</OkxTh>
                    )
                  )}
                </OkxTr>
              </OkxTableHead>
              <OkxTableBody>
                {partners.map((p) => {
                  const stats = getPartnerStats(data, p.id);
                  const balance = getPartnerBalance(data, p.id);
                  return (
                    <OkxTr key={p.id}>
                      <OkxTd>
                        <Link href={`/partners/${p.id}`}>
                          <OkxCellPrimary title={p.name} subtitle={p.telegram} />
                        </Link>
                      </OkxTd>
                      <OkxTd className="text-[#71717a]">{getUserRoleLabel(p.role)}</OkxTd>
                      <OkxTd>{stats.totalLeads}</OkxTd>
                      <OkxTd>{stats.pendingReview}</OkxTd>
                      <OkxTd>{stats.approved}</OkxTd>
                      <OkxTd>{stats.replied}</OkxTd>
                      <OkxTd>{stats.closedDeals}</OkxTd>
                      <OkxTd>{formatCurrency(stats.salesAmount)}</OkxTd>
                      <OkxTd>{formatCurrency(stats.commissionAccrued)}</OkxTd>
                      <OkxTd className="font-medium">{formatCurrency(balance)}</OkxTd>
                    </OkxTr>
                  );
                })}
              </OkxTableBody>
            </OkxTable>
          </OkxTableScroll>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
