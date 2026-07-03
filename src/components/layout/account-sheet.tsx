"use client";

import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AccountSheetContent } from "@/components/layout/account-sheet-content";
import { useCurrentUser } from "@/lib/store";
import { getUserRoleLabel } from "@/lib/statuses";
import { cn } from "@/lib/utils";

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSheet({ open, onOpenChange }: AccountSheetProps) {
  const user = useCurrentUser();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex h-dvh max-h-dvh flex-col gap-0 overflow-hidden bg-white p-0 shadow-none",
          "!w-[min(96vw,560px)] !max-w-[560px] min-w-[320px] sm:min-w-[420px]",
          "data-ending-style:translate-x-full data-starting-style:translate-x-full"
        )}
      >
        <header className="z-20 shrink-0 border-b border-[#ebebeb] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-[#050505]">{user.name}</h2>
              <p className="mt-1 text-sm text-[#6b7280]">{getUserRoleLabel(user.role)}</p>
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
          <AccountSheetContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
