"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProspectDetail } from "@/components/prospecting/prospect-detail-context";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/access/role-guard";
import { EmptyState } from "@/components/ui/empty-state";
import { OkxPagination } from "@/components/ui/okx-table";
import { ProspectingHeader } from "@/components/prospecting/prospecting-header";
import { ProspectingStats } from "@/components/prospecting/prospecting-stats";
import { DailyProgress } from "@/components/prospecting/daily-progress";
import { ProspectingFilters, type ProspectFiltersState } from "@/components/prospecting/prospecting-filters";
import { ProspectingTable } from "@/components/prospecting/prospecting-table";
import { ProspectingBoard } from "@/components/prospecting/prospecting-board";
import { ProspectForm, type ProspectFormValues } from "@/components/prospecting/prospect-form";
import { ConvertToLeadDialog } from "@/components/prospecting/convert-to-lead-dialog";
import { useApp, useCurrentUser } from "@/lib/store";
import {
  filterProspects,
  filterProspectsForUser,
  exportProspectsToCSV,
  addFollowUpDays,
} from "@/lib/prospecting-utils";
import type { ProspectContact, ProspectStatus } from "@/lib/prospecting-types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function ProspectingPage() {
  const { openProspect } = useProspectDetail();
  const user = useCurrentUser();
  const {
    data,
    createProspectContact,
    updateProspectContact,
    deleteProspectContact,
    checkProspectDuplicate,
    convertProspectToLead,
  } = useApp();

  const [view, setView] = useState<"table" | "board">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [convertId, setConvertId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProspectFiltersState>({
    search: "",
    status: "all",
    niche: "all",
    source: "all",
    city: "all",
    priority: "all",
    followUpToday: false,
    noWebsite: false,
    badWebsite: false,
  });

  const baseProspects = useMemo(
    () => filterProspectsForUser(data.prospectContacts ?? [], user.id, user.role),
    [data.prospectContacts, user.id, user.role]
  );

  const filtered = useMemo(
    () => filterProspects(baseProspects, filters),
    [baseProspects, filters]
  );

  const cities = useMemo(
    () => [...new Set(baseProspects.map((p) => p.city).filter(Boolean))].sort(),
    [baseProspects]
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const convertProspect = convertId ? baseProspects.find((p) => p.id === convertId) ?? null : null;

  function patchFilters(patch: Partial<ProspectFiltersState>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function formToProspect(values: ProspectFormValues): Partial<ProspectContact> {
    return { ...values, createdBy: user.id };
  }

  function handleSave(values: ProspectFormValues, action: "save" | "message") {
    if (!values.businessName.trim()) {
      toast.error("Укажите название бизнеса");
      return;
    }
    const dup = checkProspectDuplicate({
      businessName: values.businessName,
      website: values.website,
      instagram: values.instagram,
      telegram: values.telegram,
      phone: values.phone,
      email: values.email,
    });
    if (dup) {
      toast.error(`Дубль: ${dup.businessName}`);
      createProspectContact({
        ...formToProspect(values),
        status: "duplicate",
        duplicateLeadId: dup.type === "lead" ? dup.id : null,
      });
      setFormOpen(false);
      return;
    }
    const status: ProspectStatus = action === "message" ? "messaged" : "new";
    const contact = createProspectContact({
      ...formToProspect(values),
      status,
      firstMessageSentAt: action === "message" ? new Date().toISOString().slice(0, 10) : null,
      followUpAt: action === "message" ? addFollowUpDays(2) : null,
    });
    toast.success("Контакт добавлен в список поиска");
    setFormOpen(false);
    if (action === "message") openProspect(contact.id);
  }

  function handleMarkMessaged(id: string) {
    updateProspectContact(
      id,
      {
        status: "messaged",
        firstMessageSentAt: new Date().toISOString().slice(0, 10),
        followUpAt: addFollowUpDays(2),
        messageTemplateUsed: "manual",
      },
      user.id,
      "Отмечено: написали"
    );
    toast.success("Статус: Написали");
  }

  function handleConvert(id: string) {
    const lead = convertProspectToLead(id, user.id);
    if (lead) {
      toast.success("Контакт добавлен в лиды и отправлен на проверку админу");
      setConvertId(null);
    } else {
      toast.error("Не удалось добавить — возможно дубль");
    }
  }

  return (
    <RoleGuard resource="prospecting" redirectTo="/my">
      <AppLayout title="Поиск клиентов" showAddLead={false} showSearch={false}>
        <div className="space-y-6">
          <ProspectingHeader
            onAdd={() => setFormOpen(true)}
            onExport={() => void exportProspectsToCSV(filtered)}
          />

          <ProspectingStats prospects={baseProspects} />
          <DailyProgress prospects={baseProspects} />

          <div className="flex gap-2">
            {(["table", "board"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium",
                  view === v ? "bg-[var(--color-sunrise-coral)] text-white" : "bg-[#f4f4f5] text-[#71717a]"
                )}
              >
                {v === "table" ? "Таблица" : "Доска"}
              </button>
            ))}
          </div>

          <ProspectingFilters
            filters={filters}
            cities={cities}
            onChange={patchFilters}
            open={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />

          {filtered.length === 0 ? (
            <EmptyState title="Пока нет контактов" description="Добавь первый бизнес из 2ГИС или Instagram." />
          ) : view === "table" ? (
            <>
              <ProspectingTable
                prospects={paginated}
                onOpen={openProspect}
                onMarkMessaged={handleMarkMessaged}
                onDelete={(id) => { deleteProspectContact(id); toast.success("Удалено"); }}
                onConvert={(id) => setConvertId(id)}
              />
              <OkxPagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={filtered.length}
                totalPages={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
                onPageChange={setPage}
              />
            </>
          ) : (
            <ProspectingBoard
              prospects={filtered}
              onOpen={openProspect}
              onStatusChange={(id, status) => updateProspectContact(id, { status }, user.id, `Статус: ${status}`)}
            />
          )}
        </div>

        <ProspectForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
        <ConvertToLeadDialog
          open={!!convertId}
          prospect={convertProspect}
          onClose={() => setConvertId(null)}
          onConfirm={() => convertId && handleConvert(convertId)}
        />
      </AppLayout>
    </RoleGuard>
  );
}
