"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { OkxPageTitle, OkxTable, OkxTableBody, OkxTr, OkxTd } from "@/components/ui/okx-table";
import {
  ChartPanel,
  LeadsChart,
  SalesChart,
  ConversionChart,
  TopPartnersChart,
} from "@/components/charts/dashboard-charts";
import { useAppData, useCurrentUser } from "@/lib/store";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import {
  getDashboardStats,
  getAttentionItems,
  getLeadsByDay,
  getDealsByMonth,
  getSalesByMonth,
  getCommissionsByMonth,
  getConversionFunnel,
  getTopPartners,
  getTopSources,
  getTopServicesByRevenue,
  getPartnerMonthlyTrends,
} from "@/lib/analytics";
import { isPartner } from "@/lib/access";
import { formatCurrency } from "@/lib/commission";
import { formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const data = useAppData();
  const user = useCurrentUser();
  const partnerId = isPartner(user) ? user.id : undefined;
  const stats = getDashboardStats(data, partnerId);
  const attention = isPartner(user) ? [] : getAttentionItems(data);
  const { openLead } = useLeadDetail();

  const partnerView = isPartner(user);
  const partnerTrends = partnerView ? getPartnerMonthlyTrends(data, user.id) : null;

  const partnerLeads = partnerView ? getLeadsByDay(data, 14, user.id) : [];
  const partnerDeals = partnerView ? getDealsByMonth(data, user.id) : [];
  const partnerSales = partnerView ? getSalesByMonth(data, user.id) : [];
  const partnerCommissions = partnerView ? getCommissionsByMonth(data, user.id) : [];
  const partnerFunnel = partnerView ? getConversionFunnel(data, user.id) : [];

  return (
    <AppLayout title="Главная" showSearch={false}>
      <div className="space-y-8 md:space-y-10">
        <OkxPageTitle
          title={partnerView ? `Привет, ${user.name}` : "Обзор панели"}
          description={
            partnerView
              ? "Сводка по клиентам, сделкам и комиссии"
              : "Статистика клиентов, партнёров и сделок по всей системе"
          }
        />

        {!partnerView && attention.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-carbon-black)]">
              <AlertCircle className="size-4" />
              Требует внимания
            </h2>
            <OkxTable>
              <OkxTableBody>
                {attention.map((item) => (
                  <OkxTr key={item.id}>
                    <OkxTd>
                      {item.href.startsWith("/leads/") ? (
                        <button
                          type="button"
                          onClick={() => openLead(item.href.replace("/leads/", ""))}
                          className="text-left font-medium hover:underline"
                        >
                          {item.title}
                        </button>
                      ) : (
                        <Link href={item.href} className="font-medium hover:underline">
                          {item.title}
                        </Link>
                      )}
                      <p className="text-sm text-[var(--color-zinc-gray)]">{item.subtitle}</p>
                    </OkxTd>
                    <OkxTd className="text-right text-sm text-[var(--color-zinc-gray)]">
                      {formatDate(new Date().toISOString())}
                    </OkxTd>
                  </OkxTr>
                ))}
              </OkxTableBody>
            </OkxTable>
          </div>
        )}

        {partnerView ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Клиентов" value={stats.totalLeads} change={partnerTrends?.leads} />
              <StatCard label="В работе" value={stats.inProgress} />
              <StatCard
                label="Закрыто сделок"
                value={stats.closedDeals}
                change={partnerTrends?.closedDeals}
              />
              <StatCard
                label="К выплате"
                value={formatCurrency(stats.commissionToPay)}
                change={partnerTrends?.balance}
              />
            </div>

            <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
              <ChartPanel
                title="Клиенты по дням"
                description="Новые клиенты за последние 14 дней"
              >
                <LeadsChart
                  data={partnerLeads}
                  dataKey="count"
                  xKey="date"
                  emptyLabel="Добавьте первого клиента — здесь появится динамика"
                />
              </ChartPanel>

              <ChartPanel
                title="Сделки по месяцам"
                description="Оплаченные сделки за полгода"
              >
                <SalesChart
                  data={partnerDeals}
                  dataKey="count"
                  xKey="month"
                  emptyLabel="Оплаченных сделок пока нет"
                />
              </ChartPanel>

              <ChartPanel
                title="Продажи по месяцам"
                description="Сумма оплат за полгода"
              >
                <SalesChart
                  data={partnerSales}
                  dataKey="amount"
                  xKey="month"
                  valueFormat="currency"
                  emptyLabel="Выручка появится после первой оплаты"
                />
              </ChartPanel>

              <ChartPanel
                title="Комиссии по месяцам"
                description="Начисления на баланс за полгода"
              >
                <SalesChart
                  data={partnerCommissions}
                  dataKey="amount"
                  xKey="month"
                  valueFormat="currency"
                  emptyLabel="Комиссия появится после начислений"
                />
              </ChartPanel>

              <ChartPanel
                title="Воронка конверсии"
                description="Как клиенты проходят этапы"
              >
                <ConversionChart
                  data={partnerFunnel}
                  emptyLabel="Воронка появится после первых клиентов"
                />
              </ChartPanel>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
              <StatCard label="Всего клиентов" value={stats.totalLeads} />
              <StatCard label="На проверке" value={stats.pendingReview} />
              <StatCard label="Одобрено" value={stats.approved} />
              <StatCard label="В работе" value={stats.inProgress} />
              <StatCard label="Закрыто сделок" value={stats.closedDeals} />
              <StatCard label="Сумма продаж" value={formatCurrency(stats.salesAmount)} />
              <StatCard label="Комиссии начислено" value={formatCurrency(stats.commissionAccrued)} />
              <StatCard label="К выплате" value={formatCurrency(stats.commissionToPay)} />
            </div>

            <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
              <ChartPanel title="Клиенты по дням" description="За последние 14 дней">
                <LeadsChart data={getLeadsByDay(data)} dataKey="count" xKey="date" />
              </ChartPanel>
              <ChartPanel title="Сделки по месяцам" description="Оплаченные за полгода">
                <SalesChart data={getDealsByMonth(data)} dataKey="count" xKey="month" />
              </ChartPanel>
              <ChartPanel title="Продажи по месяцам" description="Сумма оплат за полгода">
                <SalesChart
                  data={getSalesByMonth(data)}
                  dataKey="amount"
                  xKey="month"
                  valueFormat="currency"
                />
              </ChartPanel>
              <ChartPanel title="Комиссии по месяцам" description="Начисления за полгода">
                <SalesChart
                  data={getCommissionsByMonth(data)}
                  dataKey="amount"
                  xKey="month"
                  valueFormat="currency"
                />
              </ChartPanel>
              <ChartPanel title="Конверсия по этапам">
                <ConversionChart data={getConversionFunnel(data)} />
              </ChartPanel>
              <ChartPanel title="Топ партнёров">
                <TopPartnersChart data={getTopPartners(data)} />
              </ChartPanel>
              <ChartPanel title="Топ источников">
                <TopPartnersChart
                  data={getTopSources(data).map((s) => ({ name: s.source, deals: s.count }))}
                  valueLabel="Клиенты"
                />
              </ChartPanel>
              <ChartPanel title="Топ услуг по выручке">
                <TopPartnersChart
                  data={getTopServicesByRevenue(data).map((s) => ({
                    name: s.service,
                    deals: s.revenue,
                  }))}
                  valueLabel="Выручка"
                  emptyLabel="Нет оплаченных услуг"
                />
              </ChartPanel>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
