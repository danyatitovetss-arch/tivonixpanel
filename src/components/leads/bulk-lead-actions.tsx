"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExportButton } from "@/components/common/export-button";
import { LEAD_EXPORT_COLUMNS } from "@/lib/export-columns";
import { clientCountLabel } from "@/lib/ui-copy";
import type { User } from "@/lib/types";

interface BulkLeadActionsProps {
  count: number;
  managers: User[];
  exportRows: Record<string, unknown>[];
  onApprove: () => void;
  onReject: (reason: string) => void;
  onDuplicate: (reason: string) => void;
  onAssignManager: (managerId: string) => void;
  onClear: () => void;
}

export function BulkLeadActions({
  count,
  managers,
  exportRows,
  onApprove,
  onReject,
  onDuplicate,
  onAssignManager,
  onClear,
}: BulkLeadActionsProps) {
  const [modal, setModal] = useState<"approve" | "reject" | "duplicate" | "manager" | null>(null);
  const [comment, setComment] = useState("");
  const [managerId, setManagerId] = useState("");

  if (count === 0) return null;

  function close() {
    setModal(null);
    setComment("");
    setManagerId("");
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-2xl bg-[#f6f6f6] p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="text-sm text-[#6b7280]">Выбрано: {count}</span>
        <button type="button" onClick={() => setModal("approve")} className="rounded-full bg-[#050505] px-4 py-2 text-sm text-white">
          Одобрить
        </button>
        <button type="button" onClick={() => setModal("reject")} className="rounded-full bg-white px-4 py-2 text-sm">
          Отклонить
        </button>
        <button type="button" onClick={() => setModal("duplicate")} className="rounded-full bg-white px-4 py-2 text-sm">
          Дубль
        </button>
        <button type="button" onClick={() => setModal("manager")} className="rounded-full bg-white px-4 py-2 text-sm">
          Назначить менеджера
        </button>
        <ExportButton
          data={exportRows}
          filename="klienty-vybrannye"
          columns={LEAD_EXPORT_COLUMNS}
          label="Excel выбранное"
          sheetName="Выбранные"
          className="h-auto rounded-full py-2"
        />
        <button type="button" onClick={onClear} className="text-sm text-[#6b7280] underline sm:ml-auto">
          Сбросить
        </button>
      </div>

      <Dialog open={modal === "approve"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Одобрить {clientCountLabel(count)}?</DialogTitle>
            <DialogDescription>Клиенты станут доступны для работы партнёров.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="flex-1 rounded-xl border py-2 text-sm">Отмена</button>
            <button type="button" onClick={() => { onApprove(); toast.success("Одобрено"); close(); }} className="flex-1 rounded-xl bg-[#050505] py-2 text-sm text-white">Одобрить</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "reject"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Отклонить {clientCountLabel(count)}</DialogTitle>
          </DialogHeader>
          <Label>Причина</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={close} className="flex-1 rounded-xl border py-2 text-sm">Отмена</button>
            <button type="button" onClick={() => {
              if (!comment.trim()) { toast.error("Укажите причину"); return; }
              onReject(comment);
              toast.success("Отклонено");
              close();
            }} className="flex-1 rounded-xl bg-[#050505] py-2 text-sm text-white">Отклонить</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "duplicate"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Отметить {count} как дубль</DialogTitle>
          </DialogHeader>
          <Label>Причина</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={close} className="flex-1 rounded-xl border py-2 text-sm">Отмена</button>
            <button type="button" onClick={() => {
              if (!comment.trim()) { toast.error("Укажите причину"); return; }
              onDuplicate(comment);
              toast.success("Отмечено как дубль");
              close();
            }} className="flex-1 rounded-xl bg-[#050505] py-2 text-sm text-white">Подтвердить</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "manager"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Назначить менеджера на {clientCountLabel(count)}</DialogTitle>
          </DialogHeader>
          <Label>Менеджер</Label>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#e5e5e5] px-3 text-sm"
          >
            <option value="">Выберите менеджера</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={close} className="flex-1 rounded-xl border py-2 text-sm">Отмена</button>
            <button type="button" onClick={() => {
              if (!managerId) { toast.error("Выберите менеджера"); return; }
              onAssignManager(managerId);
              toast.success("Менеджер назначен");
              close();
            }} className="flex-1 rounded-xl bg-[#050505] py-2 text-sm text-white">Назначить</button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
