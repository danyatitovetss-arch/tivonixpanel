"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard, useCan } from "@/components/access/role-guard";
import {
  OkxPageTitle,
  OkxTable,
  OkxTableBody,
  OkxTr,
  OkxTd,
  OkxCellPrimary,
} from "@/components/ui/okx-table";
import { AppModal, ModalActions, ModalField, fieldClass } from "@/components/ui/app-modal";
import { UsersManagement } from "@/components/users/users-management";
import { useApp, useCurrentUser } from "@/lib/store";
import { isDemoMode } from "@/lib/demo-mode";
import { LEAD_STATUS_LABELS, getUserRoleLabel } from "@/lib/statuses";

type SettingsModal = "profile" | "commission" | "roles" | "statuses" | "demo" | null;

export default function SettingsPage() {
  const { data, updateCommissionSettings, resetDemoData } = useApp();
  const user = useCurrentUser();
  const canEdit = useCan("edit_commission_settings");
  const demo = isDemoMode();
  const [modal, setModal] = useState<SettingsModal>(null);
  const s = data.commissionSettings;

  const [commissionForm, setCommissionForm] = useState({
    basePercentUnder2000: s.basePercentUnder2000,
    basePercentFrom2000: s.basePercentFrom2000,
    bonusAfterClosedDeals: s.bonusAfterClosedDeals,
    bonusPercent: s.bonusPercent,
  });

  function openCommission() {
    setCommissionForm({
      basePercentUnder2000: s.basePercentUnder2000,
      basePercentFrom2000: s.basePercentFrom2000,
      bonusAfterClosedDeals: s.bonusAfterClosedDeals,
      bonusPercent: s.bonusPercent,
    });
    setModal("commission");
  }

  const partnersCount = data.users.filter((u) => u.role === "partner").length;

  const rows = [
    {
      id: "profile" as const,
      title: "Мой профиль",
      subtitle: `${user.name} · ${getUserRoleLabel(user.role)}`,
      show: true,
      onClick: () => setModal("profile"),
    },
    {
      id: "commission" as const,
      title: "Комиссия партнёров",
      subtitle: `${s.basePercentUnder2000}% до $2000 · ${s.basePercentFrom2000}% от $2000`,
      show: canEdit,
      onClick: openCommission,
    },
    {
      id: "roles" as const,
      title: "Роли и доступы",
      subtitle: "Админ, менеджер, партнёр",
      show: true,
      onClick: () => setModal("roles"),
    },
    {
      id: "statuses" as const,
      title: "Статусы клиентов",
      subtitle: `${Object.keys(LEAD_STATUS_LABELS).length} статусов в CRM`,
      show: true,
      onClick: () => setModal("statuses"),
    },
    {
      id: "demo" as const,
      title: "Demo-данные",
      subtitle: demo ? "Локальный режим включён" : "Сброс mock-данных",
      show: canEdit && demo,
      onClick: () => setModal("demo"),
    },
  ].filter((r) => r.show);

  return (
    <RoleGuard resource="settings" redirectTo="/dashboard">
      <AppLayout title="Настройки" showAddLead={false} showSearch={false}>
        <div className="space-y-8">
          <OkxPageTitle
            title="Настройки"
            description="Профиль, комиссия, пользователи и параметры CRM"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-[#f4f4f5] px-5 py-4">
              <p className="text-2xl font-bold tracking-tight text-[#18181b]">{getUserRoleLabel(user.role)}</p>
              <p className="mt-1 text-sm text-[#71717a]">Ваша роль</p>
            </div>
            <div className="rounded-2xl bg-[#f4f4f5] px-5 py-4">
              <p className="text-2xl font-bold tracking-tight text-[#18181b]">{partnersCount}</p>
              <p className="mt-1 text-sm text-[#71717a]">Партнёров в системе</p>
            </div>
            <div className="rounded-2xl bg-[#f4f4f5] px-5 py-4">
              <p className="text-2xl font-bold tracking-tight text-[#18181b]">{s.basePercentUnder2000}%</p>
              <p className="mt-1 text-sm text-[#71717a]">Комиссия до $2000</p>
            </div>
            <div className="rounded-2xl bg-[#f4f4f5] px-5 py-4">
              <p className="text-2xl font-bold tracking-tight text-[#18181b]">{s.basePercentFrom2000}%</p>
              <p className="mt-1 text-sm text-[#71717a]">Комиссия от $2000</p>
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[#18181b]">Разделы</h2>
              <p className="text-sm text-[#71717a]">Откройте нужный блок в модальном окне</p>
            </div>
            <OkxTable>
              <OkxTableBody>
                {rows.map((row) => (
                  <OkxTr key={row.id}>
                      <OkxTd>
                        <button
                          type="button"
                          onClick={row.onClick}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <OkxCellPrimary
                            title={row.title}
                            subtitle={row.subtitle}
                            initials={row.title.slice(0, 1)}
                          />
                          <ChevronRight className="size-4 shrink-0 text-[#71717a]" />
                        </button>
                      </OkxTd>
                    </OkxTr>
                ))}
              </OkxTableBody>
            </OkxTable>
          </section>

          {canEdit && <UsersManagement />}
        </div>

        <AppModal
          open={modal === "profile"}
          onClose={() => setModal(null)}
          title="Мой профиль"
          description="Данные вашего аккаунта в CRM"
        >
          <div className="space-y-4">
            <ModalField label="Имя">
              <input className={fieldClass} defaultValue={user.name} disabled />
            </ModalField>
            <ModalField label="Email">
              <input className={fieldClass} defaultValue={user.email} disabled />
            </ModalField>
            <ModalField label="Telegram">
              <input className={fieldClass} defaultValue={user.telegram} disabled />
            </ModalField>
            <ModalField label="Роль">
              <input className={fieldClass} defaultValue={getUserRoleLabel(user.role)} disabled />
            </ModalField>
            <ModalActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} confirmLabel="Закрыть" primary />
          </div>
        </AppModal>

        <AppModal
          open={modal === "commission"}
          onClose={() => setModal(null)}
          title="Настройки комиссии"
          description="Проценты начисляются партнёрам при закрытии сделок"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["basePercentUnder2000", "Процент до $2000"],
                  ["basePercentFrom2000", "Процент от $2000"],
                  ["bonusAfterClosedDeals", "Бонус после N сделок"],
                  ["bonusPercent", "Бонусный %"],
                ] as const
              ).map(([key, label]) => (
                <ModalField key={key} label={label}>
                  <input
                    type="number"
                    className={fieldClass}
                    value={commissionForm[key]}
                    onChange={(e) =>
                      setCommissionForm({ ...commissionForm, [key]: Number(e.target.value) })
                    }
                  />
                </ModalField>
              ))}
            </div>
            <ModalActions
              onCancel={() => setModal(null)}
              onConfirm={() => {
                updateCommissionSettings(commissionForm);
                toast.success("Комиссия сохранена");
                setModal(null);
              }}
              confirmLabel="Сохранить"
              primary
            />
          </div>
        </AppModal>

        <AppModal
          open={modal === "roles"}
          onClose={() => setModal(null)}
          title="Роли и доступы"
          description="Кто что может делать в панели"
        >
          <div className="space-y-3">
            {[
              { role: "admin" as const, desc: "Создаёт партнёров, подтверждает клиентов, сделки и выплаты" },
              { role: "manager" as const, desc: "Обрабатывает клиентов и меняет статусы" },
              { role: "partner" as const, desc: "Ищет клиентов, добавляет в CRM и видит свои результаты" },
            ].map((r) => (
              <div key={r.role} className="rounded-xl bg-[#f4f4f5] px-4 py-3 text-sm">
                <span className="font-semibold text-[#18181b]">{getUserRoleLabel(r.role)}</span>
                <span className="text-[#71717a]"> — {r.desc}</span>
              </div>
            ))}
            <ModalActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} confirmLabel="Понятно" primary />
          </div>
        </AppModal>

        <AppModal
          open={modal === "statuses"}
          onClose={() => setModal(null)}
          title="Статусы клиентов"
          description="Справочник статусов в CRM"
        >
          <div className="flex max-h-[320px] flex-wrap gap-2 overflow-y-auto">
            {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
              <span
                key={k}
                className="rounded-full bg-[#f4f4f5] px-3 py-1.5 text-xs font-medium text-[#18181b]"
                title={k}
              >
                {v}
              </span>
            ))}
          </div>
          <ModalActions
            className="mt-4"
            onCancel={() => setModal(null)}
            onConfirm={() => setModal(null)}
            confirmLabel="Закрыть"
            primary
          />
        </AppModal>

        <AppModal
          open={modal === "demo"}
          onClose={() => setModal(null)}
          title="Сброс demo-данных"
          description="Вернуть mock-клиентов и сделки к начальному состоянию"
        >
          <p className="text-sm text-[#71717a]">
            Действие затронет только локальные demo-данные в браузере. Продакшен-данные Supabase не изменятся.
          </p>
          <ModalActions
            className="mt-4"
            onCancel={() => setModal(null)}
            onConfirm={() => {
              resetDemoData();
              toast.success("Mock-данные сброшены");
              setModal(null);
            }}
            confirmLabel="Сбросить"
            primary
          />
        </AppModal>
      </AppLayout>
    </RoleGuard>
  );
}
