"use client";

import type { ProspectDuplicateMatch } from "@/lib/prospecting-types";
import { PROSPECT_STATUS_LABELS } from "@/lib/prospecting-data";
import type { LeadStatus } from "@/lib/types";
import { getLeadStatusLabel } from "@/lib/statuses";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import { useProspectDetail } from "@/components/prospecting/prospect-detail-context";

interface DuplicateCheckPanelProps {
  match: ProspectDuplicateMatch | null;
  onMarkDuplicate?: () => void;
}

export function DuplicateCheckPanel({ match, onMarkDuplicate }: DuplicateCheckPanelProps) {
  const { openLead } = useLeadDetail();
  const { openProspect } = useProspectDetail();

  if (!match) {
    return (
      <div className="rounded-2xl bg-[#f6f6f6] p-4 text-sm text-[#6b7280]">
        Дубль не найден. Можно писать или добавлять в CRM.
      </div>
    );
  }

  const statusLabel =
    match.type === "lead"
      ? getLeadStatusLabel(match.status as LeadStatus)
      : PROSPECT_STATUS_LABELS[match.status as keyof typeof PROSPECT_STATUS_LABELS] ?? match.status;

  function handleOpen() {
    if (match!.type === "lead") openLead(match!.id);
    else openProspect(match!.id);
  }

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-[#f6f6f6] p-4">
      <p className="text-sm font-semibold text-[#050505]">Похоже, этот бизнес уже есть в CRM</p>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2"><dt className="text-[#9ca3af]">Где:</dt><dd>{match.type === "lead" ? "Лиды" : "Поиск клиентов"}</dd></div>
        <div className="flex gap-2"><dt className="text-[#9ca3af]">Название:</dt><dd>{match.businessName}</dd></div>
        <div className="flex gap-2"><dt className="text-[#9ca3af]">Статус:</dt><dd>{statusLabel}</dd></div>
        <div className="flex gap-2"><dt className="text-[#9ca3af]">Кто добавил:</dt><dd>{match.createdBy}</dd></div>
        <div className="flex gap-2"><dt className="text-[#9ca3af]">Совпадение:</dt><dd>{match.matchedField}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className="rounded-full bg-[#050505] px-4 py-2 text-sm font-medium text-white"
        >
          Открыть
        </button>
        {onMarkDuplicate && (
          <button type="button" onClick={onMarkDuplicate} className="rounded-full bg-white px-4 py-2 text-sm font-medium">
            Отметить дубль
          </button>
        )}
      </div>
    </div>
  );
}
