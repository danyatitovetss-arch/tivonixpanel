"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/access/role-guard";
import { ExportButton } from "@/components/common/export-button";
import { REPORT_EXPORT_COLUMNS, formatExportDate } from "@/lib/export-columns";
import { OkxPageTitle } from "@/components/ui/okx-table";
import { useAppData } from "@/lib/store";
import { getLeadStatusLabel } from "@/lib/statuses";
import { getUserName, getConversionFunnel, getTopSources, getTopServicesByRevenue } from "@/lib/analytics";
import { DEAL_PAYMENT_LABELS } from "@/lib/statuses";
import { PAYOUT_STATUS_LABELS } from "@/lib/statuses";

const REPORTS = [
  { id: "leads", label: "Отчёт по клиентам" },
  { id: "deals", label: "Отчёт по сделкам" },
  { id: "partners", label: "Отчёт по партнёрам" },
  { id: "payouts", label: "Отчёт по выплатам" },
  { id: "conversion", label: "Отчёт по конверсии" },
  { id: "sources", label: "Отчёт по источникам" },
  { id: "services", label: "Отчёт по услугам" },
] as const;

export default function ReportsPage() {
  const data = useAppData();
  const [report, setReport] = useState<(typeof REPORTS)[number]["id"]>("leads");
  const [partnerFilter, setPartnerFilter] = useState("all");

  function getExportData(): Record<string, unknown>[] {
    switch (report) {
      case "leads":
        return data.leads
          .filter((l) => partnerFilter === "all" || l.partnerId === partnerFilter)
          .map((l) => ({
            business: l.businessName,
            status: getLeadStatusLabel(l.status),
            partner: getUserName(data, l.partnerId),
            city: l.city,
            source: l.source,
            created: formatExportDate(l.createdAt),
          }));
      case "deals":
        return data.deals.map((d) => ({
          client: d.clientName,
          amount: d.amount,
          partner: getUserName(data, d.partnerId),
          payment: DEAL_PAYMENT_LABELS[d.paymentStatus],
          commission: d.commissionAmount,
        }));
      case "partners":
        return data.users.filter((u) => u.role === "partner").map((u) => ({
          name: u.name,
          leads: data.leads.filter((l) => l.partnerId === u.id).length,
          deals: data.deals.filter((d) => d.partnerId === u.id && d.paymentStatus === "paid").length,
        }));
      case "payouts":
        return data.payouts.map((p) => ({
          partner: getUserName(data, p.partnerId),
          amount: p.amount,
          status: PAYOUT_STATUS_LABELS[p.status],
          date: formatExportDate(p.paidAt ?? p.createdAt),
        }));
      case "conversion":
        return getConversionFunnel(data).map((s) => ({ stage: s.stage, count: s.count }));
      case "sources":
        return getTopSources(data).map((s) => ({ source: s.source, count: s.count }));
      case "services":
        return getTopServicesByRevenue(data).map((s) => ({ service: s.service, revenue: s.revenue }));
      default:
        return [];
    }
  }

  return (
    <RoleGuard resource="reports" redirectTo="/dashboard">
      <AppLayout title="Отчёты" showAddLead={false} showSearch={false}>
        <div className="space-y-8">
          <OkxPageTitle title="Отчёты" description="Экспорт данных по клиентам, сделкам и партнёрам" />

          <div className="flex flex-wrap gap-2">
            {REPORTS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReport(r.id)}
                className={`rounded-full px-4 py-2 text-sm ${report === r.id ? "bg-[#050505] text-white" : "bg-[#f6f6f6] text-[#6b7280]"}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <select className="h-10 rounded-xl border px-3 text-sm" value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)}>
              <option value="all">Все партнёры</option>
              {data.users.filter((u) => u.role === "partner").map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <input type="date" className="h-10 rounded-xl border px-3 text-sm" placeholder="Дата от" />
            <input type="date" className="h-10 rounded-xl border px-3 text-sm" placeholder="Дата до" />
          </div>

          <ExportButton
            data={getExportData()}
            filename={`otchet-${report}`}
            columns={[...REPORT_EXPORT_COLUMNS[report]]}
          />

          <div className="rounded-2xl bg-[#f6f6f6] p-4 text-sm text-[#6b7280]">
            Выбран отчёт: {REPORTS.find((r) => r.id === report)?.label}. Записей: {getExportData().length}
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
