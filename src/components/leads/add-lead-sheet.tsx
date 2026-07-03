"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LeadForm, FormFooter } from "@/components/leads/lead-form";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

const FORM_ID = "add-lead-form";

interface AddLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadSheet({ open, onOpenChange }: AddLeadSheetProps) {
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormKey((k) => k + 1);
      setSubmitting(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#050505] md:text-2xl">
              {CLIENT_COPY.add}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="shrink-0 rounded-xl p-2 text-[#6b7280] transition-colors hover:bg-[#f6f6f6] hover:text-[#050505] disabled:pointer-events-none disabled:opacity-50"
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6 md:px-8">
          <LeadForm
            key={formKey}
            mode="sheet"
            formId={FORM_ID}
            showFooter={false}
            autoFocus
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            onSubmittingChange={setSubmitting}
          />
        </div>

        <footer className="z-30 shrink-0 bg-white px-6 py-4 md:px-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <FormFooter
            mode="sheet"
            formId={FORM_ID}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
          />
        </footer>
      </SheetContent>
    </Sheet>
  );
}
