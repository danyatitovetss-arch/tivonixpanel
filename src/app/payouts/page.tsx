"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard, useCan } from "@/components/access/role-guard";
import { BalanceCard } from "@/components/finance/balance-card";
import { OkxPageTitle, OkxTable, OkxTableBody, OkxTr, OkxTd, OkxTableScroll } from "@/components/ui/okx-table";
import { StatusBadge } from "@/components/common/status-badge";
import { useApp, useAppData } from "@/lib/store";
import { getPartnersWithBalance, getUserName } from "@/lib/analytics";
import { formatCurrency } from "@/lib/commission";
import { PAYOUT_STATUS_LABELS } from "@/lib/statuses";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPartnerBalance } from "@/lib/analytics";

export default function PayoutsPage() {
  const data = useAppData();
  const { createPayout, markPayoutPaid, currentUser } = useApp();
  const canCreate = useCan("create_payout");

  const balances = getPartnersWithBalance(data);
  const pending = data.payouts.filter((p) => p.status === "pending");
  const paidMonth = data.payouts.filter((p) => p.status === "paid" && (p.paidAt ?? "") >= "2026-06-01");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    partnerId: "",
    amount: "",
    paymentMethod: "USDT",
    paymentDetails: "",
    adminComment: "",
  });

  const available = form.partnerId ? getPartnerBalance(data, form.partnerId) : 0;

  function handleCreate() {
    const amount = Number(form.amount);
    const result = createPayout({
      partnerId: form.partnerId,
      amount,
      currency: "USD",
      paymentMethod: form.paymentMethod,
      paymentDetails: form.paymentDetails,
      adminComment: form.adminComment,
      createdBy: currentUser.id,
    });
    if (!result) {
      toast.error("Сумма превышает доступный баланс");
      return;
    }
    toast.success("Выплата создана");
    setOpen(false);
  }

  return (
    <RoleGuard resource="payouts" redirectTo="/my">
      <AppLayout title="Выплаты" showAddLead={false}>
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <OkxPageTitle title="Выплаты" description="Выплаты комиссий партнёрам" />
            {canCreate && (
              <button type="button" onClick={() => setOpen(true)} className="h-10 w-full shrink-0 rounded-full bg-[#050505] px-5 text-sm text-white sm:w-auto">
                Создать выплату
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <BalanceCard label="К выплате всего" amount={balances.reduce((s, b) => s + b.balance, 0)} />
            <BalanceCard label="Выплачено за месяц" amount={paidMonth.reduce((s, p) => s + p.amount, 0)} />
            <BalanceCard label="Ожидают" amount={pending.length} format="count" />
            <BalanceCard label="Партнёров с балансом" amount={balances.length} format="count" />
          </div>

          <OkxTableScroll>
            <OkxTable className="min-w-[720px]">
              <OkxTableBody>
              {data.payouts.map((p) => (
                <OkxTr key={p.id}>
                  <OkxTd>{getUserName(data, p.partnerId)}</OkxTd>
                  <OkxTd>{formatCurrency(getPartnerBalance(data, p.partnerId))}</OkxTd>
                  <OkxTd className="font-medium">{formatCurrency(p.amount, p.currency)}</OkxTd>
                  <OkxTd>{p.currency}</OkxTd>
                  <OkxTd><StatusBadge status={p.status} label={PAYOUT_STATUS_LABELS[p.status]} /></OkxTd>
                  <OkxTd className="text-[#6b7280]">{p.paymentMethod}</OkxTd>
                  <OkxTd className="text-[#6b7280]">{p.paidAt ? formatDate(p.paidAt) : "—"}</OkxTd>
                  <OkxTd className="text-[#6b7280]">{p.adminComment}</OkxTd>
                  <OkxTd>
                    {canCreate && p.status === "pending" && (
                      <button type="button" className="text-xs underline" onClick={() => {
                        markPayoutPaid(p.id, currentUser.id);
                        toast.success("Выплата проведена");
                      }}>Выплатить</button>
                    )}
                  </OkxTd>
                </OkxTr>
              ))}
              </OkxTableBody>
            </OkxTable>
          </OkxTableScroll>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Новая выплата</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Партнёр</Label>
                  <select className="mt-1 h-10 w-full rounded-xl border px-3 text-sm" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })}>
                    <option value="">Выберите</option>
                    {data.users.filter((u) => u.role === "partner").map((u) => (
                      <option key={u.id} value={u.id}>{u.name} — баланс {formatCurrency(getPartnerBalance(data, u.id))}</option>
                    ))}
                  </select>
                </div>
                {form.partnerId && <p className="text-sm text-[#6b7280]">Доступно: {formatCurrency(available)}</p>}
                <div><Label>Сумма</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Метод</Label><Input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></div>
                <div><Label>Реквизиты</Label><Input value={form.paymentDetails} onChange={(e) => setForm({ ...form, paymentDetails: e.target.value })} /></div>
                <div><Label>Комментарий</Label><Input value={form.adminComment} onChange={(e) => setForm({ ...form, adminComment: e.target.value })} /></div>
                <button type="button" className="w-full rounded-xl bg-[#050505] py-2 text-sm text-white" onClick={handleCreate}>Создать</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
