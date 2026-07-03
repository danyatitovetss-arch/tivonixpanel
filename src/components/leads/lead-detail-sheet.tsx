"use client";

import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LeadDetailContent } from "@/components/leads/lead-detail-content";
import { useApp } from "@/lib/store";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

interface LeadDetailSheetProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ leadId, open, onOpenChange }: LeadDetailSheetProps) {
  const { data } = useApp();
  const lead = leadId ? data.leads.find((l) => l.id === leadId) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex h-dvh max-h-dvh flex-col gap-0 overflow-hidden bg-white p-0 shadow-none",
          "!w-[min(96vw,960px)] !max-w-[960px] min-w-0 sm:min-w-[360px] lg:min-w-[640px]",
          "data-ending-style:translate-x-full data-starting-style:translate-x-full"
        )}
      >
        <header className="z-20 shrink-0 px-6 py-5 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight text-[#050505] md:text-2xl">
                {lead?.businessName ?? CLIENT_COPY.defaultName}
              </h2>
              {lead && (
                <p className="mt-1 text-sm text-[#6b7280]">
                  {lead.niche}
                  {lead.city ? ` · ${lead.city}` : ""}
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-8 md:px-8">
          {leadId && <LeadDetailContent key={leadId} leadId={leadId} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
