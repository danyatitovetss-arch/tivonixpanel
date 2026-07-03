"use client";

import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { ExportButton } from "@/components/common/export-button";
import { LEAD_EXPORT_COLUMNS, mapLeadForExport } from "@/lib/export-columns";
import { StatusBadge } from "@/components/common/status-badge";
import { useCan } from "@/components/access/role-guard";
import {
  OkxTable,
  OkxTableHead,
  OkxTableBody,
  OkxTh,
  OkxTr,
  OkxTd,
  OkxCellPrimary,
  OkxTableAction,
  OkxPageTitle,
  OkxTabs,
  OkxSearch,
  OkxPagination,
} from "@/components/ui/okx-table";
import { useApp, useCurrentUser } from "@/lib/store";
import { filterLeadsForUser } from "@/lib/access";
import { getLeadStatusLabel, ADMIN_REVIEW_LABELS } from "@/lib/statuses";
import { formatCurrency } from "@/lib/commission";
import { Plus } from "lucide-react";
import type { Lead } from "@/lib/types";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { toServiceTypeSlug } from "@/lib/service-types";
import { BulkLeadActions } from "@/components/leads/bulk-lead-actions";

type TabFilter = "all" | "pending" | "approved" | "in_progress" | "won" | "duplicate";

const PAGE_SIZE = 10;

export default function LeadsPage() {
  const { open: openAddLead } = useAddLeadSheet();
  const { openLead } = useLeadDetail();
  const { data, approveLead, rejectLead, markDuplicate, assignManager } = useApp();
  const user = useCurrentUser();
  const canApprove = useCan("approve_lead");
  const canExportAll = useCan("export_all");

  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const baseLeads = useMemo(() => filterLeadsForUser(data.leads, user), [data.leads, user]);

  const cities = [...new Set(baseLeads.map((l) => l.city))].sort();
  const partners = data.users.filter((u) => u.role === "partner");
  const managers = data.users.filter((u) => u.role === "manager");

  const filteredLeads = useMemo(() => {
    return baseLeads.filter((lead) => {
      if (activeTab === "pending" && lead.status !== "pending_review") return false;
      if (activeTab === "approved" && lead.status !== "approved") return false;
      if (activeTab === "in_progress" && !["contacted", "replied", "interested", "sent_to_team", "offer_sent"].includes(lead.status)) return false;
      if (activeTab === "won" && lead.status !== "won") return false;
      if (activeTab === "duplicate" && lead.status !== "duplicate") return false;

      if (search) {
        const q = search.toLowerCase();
        const hay = [
          lead.businessName,
          lead.contactName,
          lead.email,
          lead.phone,
          lead.telegramUsername,
          lead.instagramUrl,
          lead.website,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (partnerFilter !== "all" && lead.partnerId !== partnerFilter) return false;
      if (cityFilter !== "all" && lead.city !== cityFilter) return false;
      if (serviceFilter !== "all" && toServiceTypeSlug(lead.serviceType) !== serviceFilter) return false;
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (dateFrom && lead.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && lead.createdAt.slice(0, 10) > dateTo) return false;
      return true;
    });
  }, [baseLeads, activeTab, search, statusFilter, partnerFilter, cityFilter, serviceFilter, sourceFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter, partnerFilter, cityFilter, serviceFilter, sourceFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedLeads = filteredLeads.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const exportRows = filteredLeads.map((l) => mapLeadForExport(l, data));

  const selectedExportRows = filteredLeads
    .filter((l) => selected.includes(l.id))
    .map((l) => mapLeadForExport(l, data));

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <AppLayout title={CLIENT_COPY.title} showAddLead={false} showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <OkxPageTitle title={CLIENT_COPY.title} description={CLIENT_COPY.description} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAddLead}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#050505] px-5 text-sm font-medium text-white"
            >
              <Plus className="size-4" /> {CLIENT_COPY.add}
            </button>
            {(canExportAll || user.role === "partner") && (
              <ExportButton
                data={exportRows}
                filename="klienty"
                columns={LEAD_EXPORT_COLUMNS}
                sheetName="Клиенты"
              />
            )}
          </div>
        </div>

        <OkxSearch value={search} onChange={setSearch} placeholder="Поиск по бизнесу, контакту…" />

        <OkxTabs
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabFilter)}
          tabs={[
            { id: "all", label: "Все", count: baseLeads.length },
            { id: "pending", label: "На проверке", count: baseLeads.filter((l) => l.status === "pending_review").length },
            { id: "approved", label: "Одобрено", count: baseLeads.filter((l) => l.status === "approved").length },
            { id: "in_progress", label: "В работе", count: baseLeads.filter((l) => ["contacted", "replied", "interested", "sent_to_team", "offer_sent"].includes(l.status)).length },
            { id: "won", label: "Закрыты", count: baseLeads.filter((l) => l.status === "won").length },
            { id: "duplicate", label: "Дубли", count: baseLeads.filter((l) => l.status === "duplicate").length },
          ]}
        />

        <LeadsFilters
          filters={{
            status: statusFilter,
            partner: partnerFilter,
            city: cityFilter,
            service: serviceFilter,
            source: sourceFilter,
            dateFrom,
            dateTo,
          }}
          onChange={(patch) => {
            if (patch.status !== undefined) setStatusFilter(patch.status);
            if (patch.partner !== undefined) setPartnerFilter(patch.partner);
            if (patch.city !== undefined) setCityFilter(patch.city);
            if (patch.service !== undefined) setServiceFilter(patch.service);
            if (patch.source !== undefined) setSourceFilter(patch.source);
            if (patch.dateFrom !== undefined) setDateFrom(patch.dateFrom);
            if (patch.dateTo !== undefined) setDateTo(patch.dateTo);
          }}
          cities={cities}
          partners={partners}
          showPartner={canApprove}
          mobileOpen={filtersOpen}
          onMobileOpenChange={setFiltersOpen}
        />

        {canApprove && (
          <BulkLeadActions
            count={selected.length}
            managers={managers}
            exportRows={selectedExportRows}
            onApprove={() => {
              selected.forEach((id) => approveLead(id, user.id));
              setSelected([]);
            }}
            onReject={(reason) => {
              selected.forEach((id) => rejectLead(id, user.id, reason));
              setSelected([]);
            }}
            onDuplicate={(reason) => {
              selected.forEach((id) => markDuplicate(id, user.id, reason));
              setSelected([]);
            }}
            onAssignManager={(managerId) => {
              selected.forEach((id) => assignManager(id, managerId, user.id));
              setSelected([]);
            }}
            onClear={() => setSelected([])}
          />
        )}

        {filteredLeads.length === 0 ? (
          <EmptyState title={CLIENT_COPY.notFound} />
        ) : (
          <>
            <div className="hidden md:block">
              <OkxTable className="w-full">
                <OkxTableHead>
                  <OkxTr interactive={false}>
                    {canApprove && <OkxTh className="w-9 px-2" />}
                    <OkxTh>Бизнес</OkxTh>
                    <OkxTh className="hidden lg:table-cell">Услуга</OkxTh>
                    <OkxTh>Бюджет</OkxTh>
                    <OkxTh>Статус</OkxTh>
                    <OkxTh className="hidden sm:table-cell">Проверка</OkxTh>
                    <OkxTh className="w-[130px] text-right" />
                  </OkxTr>
                </OkxTableHead>
                <OkxTableBody>
                  {paginatedLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      canApprove={canApprove}
                      selected={selected.includes(lead.id)}
                      onToggle={() => toggleSelect(lead.id)}
                      onOpen={() => openLead(lead.id)}
                    />
                  ))}
                </OkxTableBody>
              </OkxTable>
            </div>

            <div className="space-y-3 md:hidden">
              {paginatedLeads.map((lead) => (
                <LeadMobileCard
                  key={lead.id}
                  lead={lead}
                  canApprove={canApprove}
                  selected={selected.includes(lead.id)}
                  onToggle={() => toggleSelect(lead.id)}
                  onOpen={() => openLead(lead.id)}
                />
              ))}
            </div>
          </>
        )}

        {filteredLeads.length > 0 && (
          <OkxPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredLeads.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </AppLayout>
  );
}

function LeadRow({
  lead,
  canApprove,
  selected,
  onToggle,
  onOpen,
}: {
  lead: Lead;
  canApprove: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <OkxTr className="cursor-pointer" onClick={onOpen}>
      {canApprove && (
        <OkxTd className="w-9 px-2">
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
            <input type="checkbox" checked={selected} onChange={onToggle} aria-label={CLIENT_COPY.selectCheckbox} />
          </div>
        </OkxTd>
      )}
      <OkxTd className="max-w-0">
        <OkxCellPrimary title={lead.businessName} />
      </OkxTd>
      <OkxTd className="hidden truncate text-[#6b7280] lg:table-cell" title={lead.serviceType}>
        {lead.serviceType}
      </OkxTd>
      <OkxTd className="whitespace-nowrap">{formatCurrency(lead.estimatedBudget)}</OkxTd>
      <OkxTd>
        <StatusBadge status={lead.status} label={getLeadStatusLabel(lead.status)} />
      </OkxTd>
      <OkxTd className="hidden sm:table-cell">
        <StatusBadge status={lead.adminReviewStatus} label={ADMIN_REVIEW_LABELS[lead.adminReviewStatus]} />
      </OkxTd>
      <OkxTd className="text-right">
        <div onClick={(e) => e.stopPropagation()} role="presentation">
          <OkxTableAction variant="secondary" onClick={onOpen} className="px-4">
            Подробнее
          </OkxTableAction>
        </div>
      </OkxTd>
    </OkxTr>
  );
}

function LeadMobileCard({
  lead,
  canApprove,
  selected,
  onToggle,
  onOpen,
}: {
  lead: Lead;
  canApprove: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="cursor-pointer rounded-2xl bg-[#f6f6f6] p-4 transition-colors hover:bg-[#efefef]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#050505]">{lead.businessName}</p>
          <p className="mt-0.5 truncate text-xs text-[#6b7280]">
            {[lead.serviceType, formatCurrency(lead.estimatedBudget)].filter(Boolean).join(" · ")}
          </p>
        </div>
        {canApprove && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={CLIENT_COPY.selectCheckbox}
            className="mt-1 shrink-0"
          />
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={lead.status} label={getLeadStatusLabel(lead.status)} />
        <StatusBadge status={lead.adminReviewStatus} label={ADMIN_REVIEW_LABELS[lead.adminReviewStatus]} />
      </div>
    </div>
  );
}
