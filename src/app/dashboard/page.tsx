"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardChartsCarousel } from "@/components/dashboard/dashboard-charts-carousel";
import { OkxPageTitle, OkxTable, OkxTableBody, OkxTr, OkxTd } from "@/components/ui/okx-table";
import {
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
  const adminStatTrends = [14, 22, 11, 5, 18, -7];
  const partnerTrends = partnerView ? getPartnerMonthlyTrends(data, user.id) : null;

  return (
    <AppLayout title="Главная" showSearch={false}>
      <div className={partnerView ? "space-y-6" : "space-y-10"}>
        <OkxPageTitle
          title={partnerView ? `Привет, ${user.name}` : "Обзор панели"}
          description={
            partnerView
              ? "Краткая сводка по клиентам и комиссии"
              : "Статистика клиентов, партнёров и сделок по всей системе"
          }
        />

        {!partnerView && attention.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#050505]">
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
                      <p className="text-sm text-[#6b7280]">{item.subtitle}</p>
                    </OkxTd>
                    <OkxTd className="text-right text-sm text-[#6b7280]">
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
              <StatCard label="Закрыто сделок" value={stats.closedDeals} change={partnerTrends?.closedDeals} />
              <StatCard
                label="К выплате"
                value={formatCurrency(stats.commissionToPay)}
                change={partnerTrends?.balance}
              />
            </div>

            <DashboardChartsCarousel
              slides={[
                {
                  id: "leads",
                  title: "Клиенты по дням",
                  content: (
                    <LeadsChart
                      data={getLeadsByDay(data, 14, user.id)}
                      dataKey="count"
                      xKey="date"
                      height={200}
                    />
                  ),
                },
                {
                  id: "commissions",
                  title: "Комиссии по месяцам",
                  content: (
                    <SalesChart
                      data={getCommissionsByMonth(data, user.id)}
                      dataKey="amount"
                      xKey="month"
                      height={200}
                    />
                  ),
                },
                {
                  id: "funnel",
                  title: "Воронка конверсии",
                  content: (
                    <ConversionChart
                      data={getConversionFunnel(data, user.id)}
                      height={200}
                    />
                  ),
                },
              ]}
            />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            <StatCard label="Всего клиентов" value={stats.totalLeads} change={adminStatTrends[0]} />
            <StatCard label="На проверке" value={stats.pendingReview} change={adminStatTrends[1]} />
            <StatCard label="Одобрено" value={stats.approved} change={8} />
            <StatCard label="В работе" value={stats.inProgress} change={6} />
            <StatCard label="Закрыто сделок" value={stats.closedDeals} change={adminStatTrends[3]} />
            <StatCard label="Сумма продаж" value={formatCurrency(stats.salesAmount)} change={adminStatTrends[4]} />
            <StatCard label="Комиссии начислено" value={formatCurrency(stats.commissionAccrued)} change={12} />
            <StatCard label="К выплате" value={formatCurrency(stats.commissionToPay)} change={adminStatTrends[5]} />
          </div>
        )}

        {!partnerView && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Клиенты по дням</h3>
              <LeadsChart data={getLeadsByDay(data)} dataKey="count" xKey="date" />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Сделки по месяцам</h3>
              <SalesChart data={getDealsByMonth(data)} dataKey="count" xKey="month" />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Продажи по месяцам</h3>
              <SalesChart data={getSalesByMonth(data)} dataKey="amount" xKey="month" />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Комиссии по месяцам</h3>
              <SalesChart data={getCommissionsByMonth(data)} dataKey="amount" xKey="month" />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Конверсия по этапам</h3>
              <ConversionChart data={getConversionFunnel(data)} />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Топ партнёров</h3>
              <TopPartnersChart data={getTopPartners(data)} />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Топ источников</h3>
              <TopPartnersChart data={getTopSources(data).map((s) => ({ name: s.source, deals: s.count }))} />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium text-[#6b7280]">Топ услуг по выручке</h3>
              <TopPartnersChart data={getTopServicesByRevenue(data).map((s) => ({ name: s.service, deals: s.revenue }))} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
