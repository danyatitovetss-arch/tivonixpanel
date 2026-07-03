"use client";

import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ProspectDetailContent } from "@/components/prospecting/prospect-detail-content";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ProspectDetailSheetProps {
  prospectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProspectDetailSheet({ prospectId, open, onOpenChange }: ProspectDetailSheetProps) {
  const { data } = useApp();
  const prospect = prospectId ? (data.prospectContacts ?? []).find((p) => p.id === prospectId) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex h-dvh max-h-dvh flex-col gap-0 overflow-hidden bg-white p-0 shadow-none",
          "!w-[min(96vw,720px)] !max-w-[720px] min-w-[320px] sm:min-w-[480px]",
          "data-ending-style:translate-x-full data-starting-style:translate-x-full"
        )}
      >
        <header className="z-20 shrink-0 border-b border-[#ebebeb] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-[#050505]">
                {prospect?.businessName ?? "Контакт"}
              </h2>
              {prospect && (
                <p className="mt-1 text-sm text-[#6b7280]">
                  {[prospect.niche, prospect.city, prospect.source].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 rounded-xl p-2 text-[#6b7280] transition-colors hover:bg-[#f6f6f6] hover:text-[#050505]"
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-5">
          {prospectId && (
            <ProspectDetailContent
              key={prospectId}
              prospectId={prospectId}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
