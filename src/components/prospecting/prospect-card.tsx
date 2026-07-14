import type { ProspectContact, ProspectStatus } from "@/lib/prospecting-types";
import { BOARD_COLUMNS } from "@/lib/prospecting-data";

interface ProspectCardProps {
  prospect: ProspectContact;
  nextAction: string;
  onOpen: () => void;
  onStatusChange: (id: string, status: ProspectStatus) => void;
}

export function ProspectCard({ prospect, nextAction, onOpen, onStatusChange }: ProspectCardProps) {
  const contact = prospect.instagram || prospect.phone || prospect.website || prospect.telegram;

  return (
    <div className="rounded-xl bg-white p-3">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <p className="text-sm font-medium text-[#18181b]">{prospect.businessName}</p>
        <p className="mt-0.5 text-xs text-[#71717a]">{prospect.niche || "—"} · {prospect.source}</p>
        {contact && <p className="mt-1 truncate text-xs text-[#9ca3af]">{contact}</p>}
        <p className="mt-2 text-xs font-medium text-[#18181b]">{nextAction}</p>
      </button>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg bg-[#f4f4f5] px-2 py-1 text-xs font-medium"
        >
          Открыть
        </button>
        {BOARD_COLUMNS.filter((c) => c.status !== prospect.status && c.status !== "duplicate").slice(0, 2).map((c) => (
          <button
            key={c.status}
            type="button"
            onClick={() => onStatusChange(prospect.id, c.status)}
            className="rounded-lg bg-[#f4f4f5] px-2 py-1 text-xs text-[#71717a]"
          >
            → {c.label.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
