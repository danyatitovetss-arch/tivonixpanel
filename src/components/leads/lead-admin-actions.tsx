"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Lead, Deal, User, LeadStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/status-badge";
import { CommissionPreview } from "@/components/finance/commission-preview";
import {
  ADMIN_REVIEW_LABELS,
  LEAD_STATUS_LABELS,
  getLeadStatusLabel,
} from "@/lib/statuses";
import {
  ADMIN_STATUS_GROUPS,
  getAdminActionVisibility,
  getAdminStatusOptions,
  isLeadPendingAdminReview,
} from "@/lib/lead-admin-workflow";
import type { DealPaymentStatus } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  Copy,
  Ban,
  Handshake,
  UserCog,
  RefreshCw,
} from "lucide-react";

type ModalType =
  | "approve"
  | "reject"
  | "duplicate"
  | "do_not_contact"
  | "status"
  | "manager"
  | "deal"
  | "edit_deal"
  | null;

interface LeadAdminActionsProps {
  lead: Lead;
  deal?: Deal;
  users: User[];
  commissionSettings: Parameters<typeof CommissionPreview>[0]["settings"];
  partnerClosedDealsCount: number;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onDuplicate: (comment: string) => void;
  onDoNotContact: () => void;
  onStatusChange: (status: LeadStatus, comment: string) => void;
  onAssignManager: (managerId: string) => void;
  onCreateDeal: (data: {
    amount: number;
    serviceType: string;
    notes: string;
    paymentStatus: DealPaymentStatus;
  }) => void | Promise<void>;
  onUpdateDeal?: (data: {
    amount: number;
    serviceType: string;
    notes: string;
  }) => void | Promise<void>;
}

export function LeadAdminActions({
  lead,
  deal,
  users,
  commissionSettings,
  partnerClosedDealsCount,
  onApprove,
  onReject,
  onDuplicate,
  onDoNotContact,
  onStatusChange,
  onAssignManager,
  onCreateDeal,
  onUpdateDeal,
}: LeadAdminActionsProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [dealSubmitting, setDealSubmitting] = useState(false);
  const [editDealSubmitting, setEditDealSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState<LeadStatus>(lead.status);
  const [managerId, setManagerId] = useState(lead.assignedManagerId ?? "");
  const [dealForm, setDealForm] = useState({
    amount: String(lead.estimatedBudget || ""),
    serviceType: lead.serviceType,
    notes: "",
    paymentStatus: "waiting_payment" as DealPaymentStatus,
  });
  const [editDealForm, setEditDealForm] = useState({
    amount: String(deal?.amount ?? lead.estimatedBudget ?? ""),
    serviceType: deal?.serviceType ?? lead.serviceType,
    notes: deal?.notes ?? "",
  });

  const visibility = getAdminActionVisibility(lead, !!deal);
  const statusOptions = getAdminStatusOptions(lead);
  const managers = users.filter((u) => u.role === "manager" || u.role === "admin");

  useEffect(() => {
    setNewStatus(lead.status);
    setManagerId(lead.assignedManagerId ?? "");
  }, [lead.id, lead.status, lead.assignedManagerId]);

  useEffect(() => {
    if (modal) return;
    setComment("");
  }, [lead.status, lead.adminReviewStatus, modal]);

  function close() {
    setModal(null);
    setComment("");
  }

  function openModal(type: ModalType) {
    if (type === "status") setNewStatus(lead.status);
    if (type === "manager") setManagerId(lead.assignedManagerId ?? "");
    if (type === "deal") {
      setDealForm({
        amount: String(lead.estimatedBudget || ""),
        serviceType: lead.serviceType,
        notes: "",
        paymentStatus: "waiting_payment",
      });
    }
    if (type === "edit_deal" && deal) {
      setEditDealForm({
        amount: String(deal.amount),
        serviceType: deal.serviceType,
        notes: deal.notes ?? "",
      });
    }
    setComment("");
    setModal(type);
  }

  const actions = [
    { id: "approve" as const, label: "Одобрить", icon: CheckCircle, show: visibility.approve },
    { id: "reject" as const, label: "Отклонить", icon: XCircle, show: visibility.reject },
    { id: "duplicate" as const, label: "Дубль", icon: Copy, show: visibility.duplicate },
    { id: "do_not_contact" as const, label: "Не трогать", icon: Ban, show: visibility.doNotContact },
    { id: "status" as const, label: "Статус", icon: RefreshCw, show: visibility.status },
    { id: "manager" as const, label: "Менеджер", icon: UserCog, show: visibility.manager },
    { id: "deal" as const, label: "Сделка", icon: Handshake, show: visibility.createDeal },
    {
      id: "edit_deal" as const,
      label: "Редактировать сделку",
      icon: Handshake,
      show: visibility.editDeal && !!onUpdateDeal,
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  return (
    <>
      <div className="rounded-2xl bg-[#f4f4f5] p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#18181b]">Действия админа</p>
          <StatusBadge status={lead.status} label={getLeadStatusLabel(lead.status)} />
          {(isLeadPendingAdminReview(lead) ||
            lead.adminReviewStatus === "rejected" ||
            lead.adminReviewStatus === "duplicate" ||
            lead.adminReviewStatus === "do_not_contact") &&
            lead.status !== lead.adminReviewStatus && (
            <StatusBadge
              status={lead.adminReviewStatus}
              label={`Проверка: ${ADMIN_REVIEW_LABELS[lead.adminReviewStatus]}`}
            />
          )}
        </div>
        <p className="mb-4 text-xs text-[#71717a]">
          {isLeadPendingAdminReview(lead)
            ? "Клиент на проверке — одобрите, отклоните или отметьте дубль"
            : visibility.editDeal
              ? "Сделка создана — можно редактировать сумму или подтвердить оплату на странице «Сделки»"
              : "Все подтверждения — только через модальные окна"}
        </p>
        {visibleActions.length === 0 ? (
          <p className="text-sm text-[#71717a]">Нет доступных действий для текущего статуса</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openModal(a.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#ebebeb]"
                >
                  <Icon className="size-4" />
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AdminModal open={modal === "approve"} onClose={close} title="Одобрить клиента" description="Клиент станет доступен для работы. Партнёр получит уведомление в карточке.">
        <div className="space-y-4">
          <p className="text-sm text-[#71717a]">Бизнес: <strong>{lead.businessName}</strong></p>
          <div>
            <Label>Комментарий для партнёра (необязательно)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" placeholder="Например: можно писать клиенту" />
          </div>
          <ModalActions onCancel={close} onConfirm={() => { onApprove(comment || "Одобрено админом"); toast.success("Клиент одобрен"); close(); }} confirmLabel="Одобрить" primary />
        </div>
      </AdminModal>

      <AdminModal open={modal === "reject"} onClose={close} title="Отклонить клиента" description="Партнёр увидит причину отклонения.">
        <div className="space-y-4">
          <div>
            <Label>Причина отклонения *</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" placeholder="Укажите причину" required />
          </div>
          <ModalActions onCancel={close} onConfirm={() => { if (!comment.trim()) { toast.error("Укажите причину"); return; } onReject(comment); toast.success("Клиент отклонён"); close(); }} confirmLabel="Отклонить" />
        </div>
      </AdminModal>

      <AdminModal open={modal === "duplicate"} onClose={close} title="Отметить как дубль" description="Партнёр не сможет работать с этим клиентом.">
        <div className="space-y-4">
          <div>
            <Label>Причина / ссылка на существующего клиента *</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" placeholder="Например: уже есть Glow Studio от Данилы" />
          </div>
          <ModalActions onCancel={close} onConfirm={() => { if (!comment.trim()) { toast.error("Укажите причину"); return; } onDuplicate(comment); toast.success("Отмечен как дубль"); close(); }} confirmLabel="Подтвердить дубль" />
        </div>
      </AdminModal>

      <AdminModal open={modal === "do_not_contact"} onClose={close} title="Не трогать" description="Клиент исключается из активной работы.">
        <p className="text-sm text-[#71717a]">Вы уверены? Партнёры не должны писать этому клиенту.</p>
        <ModalActions onCancel={close} onConfirm={() => { onDoNotContact(); toast.success("Отмечено: не трогать"); close(); }} confirmLabel="Подтвердить" className="mt-4" />
      </AdminModal>

      <AdminModal open={modal === "status"} onClose={close} title="Изменить статус" description={`Текущий: ${getLeadStatusLabel(lead.status)}`}>
        <div className="space-y-4">
          <div>
            <Label>Новый статус</Label>
            <select
              className="mt-1 h-10 w-full rounded-xl border px-3 text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
            >
              {ADMIN_STATUS_GROUPS.map((group) => {
                const options = group.statuses.filter((s) => statusOptions.includes(s));
                if (options.length === 0) return null;
                return (
                  <optgroup key={group.label} label={group.label}>
                    {options.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                        {s === lead.status ? " (текущий)" : ""}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div>
            <Label>Комментарий</Label>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" placeholder="Что изменилось" />
          </div>
          <ModalActions
            onCancel={close}
            onConfirm={() => {
              if (newStatus === lead.status && !comment.trim()) {
                toast.error("Выберите другой статус или добавьте комментарий");
                return;
              }
              onStatusChange(newStatus, comment || `Статус: ${getLeadStatusLabel(newStatus)}`);
              toast.success("Статус обновлён");
              close();
            }}
            confirmLabel="Сохранить"
            primary
          />
        </div>
      </AdminModal>

      <AdminModal open={modal === "manager"} onClose={close} title="Назначить менеджера" description="Менеджер будет ответственным за этого клиента.">
        <div className="space-y-4">
          <div>
            <Label>Менеджер</Label>
            <select className="mt-1 h-10 w-full rounded-xl border px-3 text-sm" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">Не назначен</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <ModalActions
            onCancel={close}
            onConfirm={() => {
              onAssignManager(managerId);
              toast.success(managerId ? "Менеджер назначен" : "Менеджер снят");
              close();
            }}
            confirmLabel="Сохранить"
            primary
          />
        </div>
      </AdminModal>

      <AdminModal open={modal === "deal"} onClose={close} title="Создать сделку" description="Сделка создаётся автоматически при закрытии клиента. Здесь — ручное создание до закрытия.">
        <div className="space-y-4">
          <div><Label>Клиент</Label><Input value={lead.businessName} disabled className="mt-1 bg-[#fafafa]" /></div>
          <div><Label>Сумма ($)</Label><Input type="number" value={dealForm.amount} onChange={(e) => setDealForm({ ...dealForm, amount: e.target.value })} className="mt-1" /></div>
          <div><Label>Услуга</Label><Input value={dealForm.serviceType} onChange={(e) => setDealForm({ ...dealForm, serviceType: e.target.value })} className="mt-1" /></div>
          <div>
            <Label>Статус оплаты</Label>
            <select className="mt-1 h-10 w-full rounded-xl border px-3 text-sm" value={dealForm.paymentStatus} onChange={(e) => setDealForm({ ...dealForm, paymentStatus: e.target.value as DealPaymentStatus })}>
              <option value="waiting_payment">Ожидает оплату</option>
              <option value="paid">Оплачено (начислить комиссию)</option>
              <option value="draft">Черновик</option>
            </select>
          </div>
          <div><Label>Комментарий</Label><Textarea value={dealForm.notes} onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })} className="mt-1" /></div>
          {dealForm.amount && (
            <CommissionPreview amount={Number(dealForm.amount)} partnerClosedDealsCount={partnerClosedDealsCount} settings={commissionSettings} />
          )}
          <ModalActions
            onCancel={close}
            disabled={dealSubmitting}
            onConfirm={() => {
              void (async () => {
                if (!dealForm.amount) {
                  toast.error("Укажите сумму");
                  return;
                }
                setDealSubmitting(true);
                try {
                  await onCreateDeal({
                    amount: Number(dealForm.amount),
                    serviceType: dealForm.serviceType,
                    notes: dealForm.notes,
                    paymentStatus: dealForm.paymentStatus,
                  });
                  close();
                } catch {
                  /* ошибка показана в onCreateDeal */
                } finally {
                  setDealSubmitting(false);
                }
              })();
            }}
            confirmLabel={dealSubmitting ? "Создание…" : "Создать сделку"}
            primary
          />
        </div>
      </AdminModal>

      <AdminModal open={modal === "edit_deal"} onClose={close} title="Редактировать сделку" description="Сумма и комментарий можно изменить после автоматического создания.">
        <div className="space-y-4">
          <div><Label>Клиент</Label><Input value={lead.businessName} disabled className="mt-1 bg-[#fafafa]" /></div>
          <div><Label>Сумма ($)</Label><Input type="number" value={editDealForm.amount} onChange={(e) => setEditDealForm({ ...editDealForm, amount: e.target.value })} className="mt-1" /></div>
          <div><Label>Услуга</Label><Input value={editDealForm.serviceType} onChange={(e) => setEditDealForm({ ...editDealForm, serviceType: e.target.value })} className="mt-1" /></div>
          <div><Label>Комментарий</Label><Textarea value={editDealForm.notes} onChange={(e) => setEditDealForm({ ...editDealForm, notes: e.target.value })} className="mt-1" /></div>
          {editDealForm.amount && (
            <CommissionPreview amount={Number(editDealForm.amount)} partnerClosedDealsCount={partnerClosedDealsCount} settings={commissionSettings} />
          )}
          <ModalActions
            onCancel={close}
            disabled={editDealSubmitting}
            onConfirm={() => {
              void (async () => {
                if (!editDealForm.amount) {
                  toast.error("Укажите сумму");
                  return;
                }
                if (!onUpdateDeal) return;
                setEditDealSubmitting(true);
                try {
                  await onUpdateDeal({
                    amount: Number(editDealForm.amount),
                    serviceType: editDealForm.serviceType,
                    notes: editDealForm.notes,
                  });
                  toast.success("Сделка обновлена");
                  close();
                } catch {
                  /* ошибка показана в onUpdateDeal */
                } finally {
                  setEditDealSubmitting(false);
                }
              })();
            }}
            confirmLabel={editDealSubmitting ? "Сохранение…" : "Сохранить"}
            primary
          />
        </div>
      </AdminModal>
    </>
  );
}

function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  primary,
  className,
  disabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  primary?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex gap-2 pt-2 ${className ?? ""}`}>
      <button type="button" onClick={onCancel} disabled={disabled} className="flex-1 rounded-xl border border-[#e4e4e7] py-2.5 text-sm font-medium disabled:opacity-50">
        Отмена
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className={`flex-1 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 ${primary ? "bg-[var(--color-sunrise-coral)] text-white" : "bg-[#f4f4f5] text-[#18181b]"}`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
