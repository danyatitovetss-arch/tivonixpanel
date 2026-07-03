"use client";

import {
  OkxTable,
  OkxTableHead,
  OkxTableBody,
  OkxTh,
  OkxTr,
  OkxTd,
  OkxCellPrimary,
} from "@/components/ui/okx-table";
import { ProspectStatusBadge } from "@/components/prospecting/prospect-status-badge";
import { ProspectRowActions } from "@/components/prospecting/prospect-row-actions";
import { PROSPECT_PRIORITY_LABELS } from "@/lib/prospecting-data";
import { getNextAction } from "@/lib/prospecting-utils";
import type { ProspectContact } from "@/lib/prospecting-types";

interface ProspectingTableProps {
  prospects: ProspectContact[];
  onOpen: (id: string) => void;
  onMarkMessaged: (id: string) => void;
  onDelete: (id: string) => void;
  onConvert: (id: string) => void;
}

function ContactLines({ p }: { p: ProspectContact }) {
  const lines = [
    p.website && `🌐 ${p.website.replace(/^https?:\/\//, "").slice(0, 24)}`,
    p.instagram && `IG ${p.instagram.replace(/.*instagram\.com\//, "@")}`,
    p.telegram && `TG ${p.telegram}`,
    p.phone && `📞 ${p.phone}`,
    p.email && p.email,
  ].filter(Boolean);

  if (lines.length === 0) return <span className="text-[#9ca3af]">—</span>;

  return (
    <div className="space-y-0.5 text-xs text-[#6b7280]">
      {lines.slice(0, 3).map((l) => (
        <div key={l} className="truncate">{l}</div>
      ))}
    </div>
  );
}

export function ProspectingTable({
  prospects,
  onOpen,
  onMarkMessaged,
  onDelete,
  onConvert,
}: ProspectingTableProps) {
  return (
    <>
      <div className="hidden md:block">
        <OkxTable>
          <OkxTableHead>
            <OkxTr interactive={false}>
              <OkxTh>Бизнес</OkxTh>
              <OkxTh>Ниша</OkxTh>
              <OkxTh>Город</OkxTh>
              <OkxTh>Источник</OkxTh>
              <OkxTh>Контакты</OkxTh>
              <OkxTh>Статус</OkxTh>
              <OkxTh>Следующее</OkxTh>
              <OkxTh className="w-12" />
            </OkxTr>
          </OkxTableHead>
          <OkxTableBody>
            {prospects.map((p) => (
              <OkxTr key={p.id} className="cursor-pointer" onClick={() => onOpen(p.id)}>
                <OkxTd>
                  <OkxCellPrimary
                    title={p.businessName}
                    subtitle={p.painPoints || p.notes || undefined}
                  />
                </OkxTd>
                <OkxTd className="text-[#6b7280]">{p.niche || "—"}</OkxTd>
                <OkxTd className="text-[#6b7280]">{p.city || "—"}</OkxTd>
                <OkxTd className="text-[#6b7280]">{p.source}</OkxTd>
                <OkxTd><ContactLines p={p} /></OkxTd>
                <OkxTd>
                  <ProspectStatusBadge status={p.status} />
                  <span className="mt-1 block text-xs text-[#9ca3af]">
                    {PROSPECT_PRIORITY_LABELS[p.priority]}
                  </span>
                </OkxTd>
                <OkxTd className="text-sm text-[#6b7280]">{getNextAction(p)}</OkxTd>
                <OkxTd className="text-right" onClick={(e) => e.stopPropagation()}>
                  <ProspectRowActions
                    prospect={p}
                    onOpen={() => onOpen(p.id)}
                    onMarkMessaged={() => onMarkMessaged(p.id)}
                    onDelete={() => onDelete(p.id)}
                    onConvert={() => onConvert(p.id)}
                  />
                </OkxTd>
              </OkxTr>
            ))}
          </OkxTableBody>
        </OkxTable>
      </div>

      <div className="space-y-3 md:hidden">
        {prospects.map((p) => (
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(p.id)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(p.id)}
            className="cursor-pointer rounded-2xl bg-[#f6f6f6] p-4 transition-colors hover:bg-[#efefef]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#050505]">{p.businessName}</p>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  {[p.niche, p.city, p.source].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-2" onClick={(e) => e.stopPropagation()}>
                <ProspectStatusBadge status={p.status} />
                <ProspectRowActions
                  prospect={p}
                  onOpen={() => onOpen(p.id)}
                  onMarkMessaged={() => onMarkMessaged(p.id)}
                  onDelete={() => onDelete(p.id)}
                  onConvert={() => onConvert(p.id)}
                />
              </div>
            </div>
            <div className="mt-3"><ContactLines p={p} /></div>
            {p.painPoints && (
              <p className="mt-2 text-xs text-[#6b7280]">{p.painPoints}</p>
            )}
            <p className="mt-2 text-xs font-medium text-[#050505]">{getNextAction(p)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
