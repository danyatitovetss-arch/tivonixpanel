"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AppModal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border border-[#e5e5e5] p-0 sm:max-w-lg",
          className
        )}
      >
        <div className="border-b border-[#e5e5e5] px-6 py-5">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-lg font-semibold text-[#050505]">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-[#6b7280]">{description}</DialogDescription>
            )}
          </DialogHeader>
        </div>
        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  primary,
  disabled,
  className,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  primary?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 pt-2", className)}>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-[#e5e5e5] py-2.5 text-sm font-medium text-[#050505] transition-colors hover:bg-[#fafafa]"
      >
        Отмена
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className={cn(
          "flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
          primary ? "bg-[#050505] text-white hover:bg-[#050505]/90" : "bg-[#f6f6f6] text-[#050505] hover:bg-[#ebebeb]"
        )}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3.5 text-sm text-[#050505] outline-none focus:border-[#050505]/20 focus:bg-white";

export function ModalField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-[#525252]">{label}</label>
      {children}
    </div>
  );
}

export { fieldClass };
