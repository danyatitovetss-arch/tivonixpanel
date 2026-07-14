"use client";

import type { Lead } from "@/lib/types";
import { StatusBadge } from "@/components/common/status-badge";
import { getLeadStatusLabel } from "@/lib/statuses";
import { formatDate } from "@/lib/utils";
import { getUserName } from "@/lib/analytics";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import type { AppData } from "@/lib/types";

interface DuplicateWarningProps {
  lead: Lead;
  matchedField: string;
  data?: AppData;
  hideDetails?: boolean;
}

export function DuplicateWarning({ lead, matchedField, data, hideDetails }: DuplicateWarningProps) {
  const { openLead } = useLeadDetail();

  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-5">
      <h3 className="font-semibold text-[#18181b]">Похоже, такой клиент уже есть в базе</h3>
      <p className="mt-1 text-sm text-[#71717a]">
        Совпадение по: {matchedField}. Чтобы партнёры не писали одному клиенту несколько раз, проверь существующую карточку.
      </p>
      <div className="mt-4 rounded-xl bg-white p-4">
        <p className="font-medium">{lead.businessName}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={lead.status} label={getLeadStatusLabel(lead.status)} />
          {!hideDetails && data && (
            <span className="text-xs text-[#71717a]">
              {getUserName(data, lead.partnerId)} · {formatDate(lead.createdAt)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => openLead(lead.id)}
          className="mt-3 inline-block rounded-full bg-[#f4f4f5] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[#f4f4f5]"
        >
          Открыть существующего клиента
        </button>
      </div>
    </div>
  );
}
