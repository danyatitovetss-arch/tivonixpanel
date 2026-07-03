"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ProspectContact } from "@/lib/prospecting-types";
import { inferServiceType } from "@/lib/prospecting-utils";

interface ConvertToLeadDialogProps {
  open: boolean;
  prospect: ProspectContact | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConvertToLeadDialog({ open, prospect, onClose, onConfirm }: ConvertToLeadDialogProps) {
  if (!prospect) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить в лиды</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#6b7280]">
          Добавляй в лиды только перспективные контакты или тех, кто ответил. Статус лида: «Ожидает проверки».
        </p>
        <ul className="mt-3 space-y-1 text-sm text-[#050505]">
          <li>· {prospect.businessName}</li>
          <li>· {prospect.niche || "—"} · {prospect.city || "—"}</li>
          <li>· Услуга: {inferServiceType(prospect)}</li>
          <li>· Источник: {prospect.source}</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onConfirm} className="flex-1 rounded-full bg-[#050505] py-2.5 text-sm font-medium text-white">
            Подтвердить
          </button>
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-[#f6f6f6] py-2.5 text-sm font-medium">
            Отмена
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
