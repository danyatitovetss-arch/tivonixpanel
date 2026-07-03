import { BOARD_COLUMNS } from "@/lib/prospecting-data";
import { getNextAction } from "@/lib/prospecting-utils";
import type { ProspectContact, ProspectStatus } from "@/lib/prospecting-types";
import { ProspectCard } from "@/components/prospecting/prospect-card";

interface ProspectingBoardProps {
  prospects: ProspectContact[];
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: ProspectStatus) => void;
}

const boardScrollClass =
  "flex w-max min-w-full gap-3 pb-3 [-ms-overflow-style:auto] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d1d5db] [&::-webkit-scrollbar-track]:bg-transparent";

export function ProspectingBoard({ prospects, onOpen, onStatusChange }: ProspectingBoardProps) {
  return (
    <div className="w-full min-w-0">
      <div className="overflow-x-auto overscroll-x-contain">
        <div className={boardScrollClass}>
          {BOARD_COLUMNS.map((col) => {
            const items = prospects.filter((p) => {
              if (col.status === "duplicate") {
                return ["duplicate", "not_relevant", "do_not_contact"].includes(p.status);
              }
              if (col.status === "needs_check") {
                return ["new", "needs_check", "checked"].includes(p.status);
              }
              return p.status === col.status;
            });

            return (
              <div
                key={col.status}
                className="flex w-64 shrink-0 snap-start flex-col rounded-2xl bg-[#f6f6f6] p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="truncate text-xs font-semibold text-[#050505]">{col.label}</h3>
                  <span className="shrink-0 text-xs text-[#9ca3af]">{items.length}</span>
                </div>
                <div className="min-h-[120px] space-y-2">
                  {items.map((p) => (
                <ProspectCard
                  key={p.id}
                  prospect={p}
                  nextAction={getNextAction(p)}
                  onOpen={() => onOpen(p.id)}
                  onStatusChange={onStatusChange}
                />
                  ))}
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-[#9ca3af]">Пусто</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-1 text-xs text-[#9ca3af] lg:hidden">Листай доску влево →</p>
    </div>
  );
}
