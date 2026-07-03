"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { AppModal, ModalActions, ModalField, fieldClass } from "@/components/ui/app-modal";
import { useApp } from "@/lib/store";
import { isDemoMode } from "@/lib/demo-mode";
import { fetchJson } from "@/lib/api/fetch-json";
import { toUserMessage } from "@/lib/errors";
import type { UserRole } from "@/lib/types";
import { getOnboardingStatusLabel, getUserRoleLabel } from "@/lib/statuses";
import {
  OkxTable,
  OkxTableBody,
  OkxTr,
  OkxTd,
  OkxCellPrimary,
  OkxTableAction,
} from "@/components/ui/okx-table";

type AdminUserRow = {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  telegram: string | null;
  role: UserRole;
  status: string;
  onboardingStatus: string;
  crmAccess: boolean;
};

function generatePassword(length = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function UsersManagement() {
  const { data, addUser } = useApp();
  const demo = isDemoMode();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [open, setOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    telegram: "",
    password: generatePassword(),
    role: "partner" as UserRole,
  });

  const loadUsers = useCallback(async () => {
    if (demo) return;
    setLoading(true);
    try {
      const json = await fetchJson<{ data: AdminUserRow[] }>("/api/admin/users");
      setUsers(json.data);
    } catch (err) {
      toast.error(toUserMessage(err, "Не удалось загрузить пользователей"));
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Заполните имя и email");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Пароль — минимум 6 символов");
      return;
    }

    if (demo) {
      addUser({
        name: form.name.trim(),
        email: form.email.trim(),
        telegram: form.telegram.trim() || "@user",
        role: form.role,
        status: "active",
      });
      toast.success(`Пользователь ${form.name} добавлен (demo)`);
      setOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const result = await fetchJson<{
        data: { email: string; temporaryPassword: string; fullName: string };
      }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          telegram: form.telegram.trim() || null,
          password: form.password,
          role: form.role === "admin" ? "partner" : form.role,
        }),
      });

      setCreatedCredentials({
        email: result.data.email,
        password: result.data.temporaryPassword,
        name: result.data.fullName,
      });
      setForm({ name: "", email: "", telegram: "", password: generatePassword(), role: "partner" });
      setOpen(false);
      setCredentialsOpen(true);
      await loadUsers();
      toast.success("Партнёр создан");
    } catch (err) {
      toast.error(toUserMessage(err, "Не удалось создать пользователя"));
    } finally {
      setSubmitting(false);
    }
  }

  const rows: AdminUserRow[] = demo
    ? data.users.map((u) => ({
        id: u.id,
        userId: u.id,
        fullName: u.name,
        email: u.email,
        telegram: u.telegram,
        role: u.role,
        status: u.status,
        onboardingStatus: "completed",
        crmAccess: true,
      }))
    : users;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#050505]">Пользователи</h2>
          <p className="text-sm text-[#6b7280]">
            {demo ? "Demo-режим: данные локальные" : "Создавайте партнёров через модальное окно"}
          </p>
        </div>
        <div className="flex gap-2">
          {!demo && (
            <OkxTableAction variant="secondary" onClick={() => void loadUsers()} aria-label="Обновить">
              <RefreshCw className="size-4" />
            </OkxTableAction>
          )}
          <OkxTableAction onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="size-4" />
              Добавить партнёра
            </span>
          </OkxTableAction>
        </div>
      </div>

      <OkxTable>
        <OkxTableBody>
          {loading ? (
            <OkxTr interactive={false}>
              <OkxTd colSpan={4} className="text-[#6b7280]">
                Загрузка…
              </OkxTd>
            </OkxTr>
          ) : rows.length === 0 ? (
            <OkxTr interactive={false}>
              <OkxTd colSpan={4} className="text-[#6b7280]">
                Пользователей пока нет — нажмите «Добавить партнёра»
              </OkxTd>
            </OkxTr>
          ) : (
            rows.map((u) => (
              <OkxTr key={u.id} interactive={false}>
                <OkxTd>
                  <OkxCellPrimary title={u.fullName ?? "—"} subtitle={u.email ?? "—"} />
                </OkxTd>
                <OkxTd className="text-[#6b7280]">{getUserRoleLabel(u.role)}</OkxTd>
                <OkxTd className="text-[#6b7280]">
                  {getOnboardingStatusLabel(u.onboardingStatus)}
                  {u.crmAccess ? " · CRM" : ""}
                </OkxTd>
                <OkxTd className="text-[#6b7280]">{u.status === "active" ? "Активен" : "Неактивен"}</OkxTd>
              </OkxTr>
            ))
          )}
        </OkxTableBody>
      </OkxTable>

      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        title="Новый партнёр"
        description="Email и временный пароль. Партнёр пройдёт анкету и задаст свой пароль."
      >
        <div className="space-y-4">
          <ModalField label="Имя *">
            <input
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Андрей"
            />
          </ModalField>
          <ModalField label="Email *">
            <input
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="andrey@example.com"
            />
          </ModalField>
          <ModalField label="Telegram">
            <input
              className={fieldClass}
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              placeholder="@username"
            />
          </ModalField>
          <ModalField label="Временный пароль *">
            <div className="flex gap-2">
              <input
                className={fieldClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                className="shrink-0 rounded-xl border border-[#e5e5e5] px-3 text-xs font-medium text-[#6b7280] hover:bg-[#fafafa]"
                onClick={() => setForm({ ...form, password: generatePassword() })}
              >
                Сгенерировать
              </button>
            </div>
          </ModalField>
          <ModalField label="Роль">
            <select
              className={fieldClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="partner">Партнёр</option>
              <option value="manager">Менеджер</option>
            </select>
          </ModalField>
          <ModalActions
            onCancel={() => setOpen(false)}
            onConfirm={() => void handleAdd()}
            confirmLabel={submitting ? "Создание…" : "Создать"}
            primary
            disabled={submitting}
          />
        </div>
      </AppModal>

      <AppModal
        open={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
        title={createdCredentials ? `Доступ: ${createdCredentials.name}` : "Доступ партнёра"}
        description="Передайте логин и пароль. После анкеты партнёр задаст свой пароль."
      >
        {createdCredentials && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl bg-[#f6f6f6] p-4 text-sm">
              <div>
                <p className="text-[#6b7280]">Email</p>
                <p className="font-medium text-[#050505]">{createdCredentials.email}</p>
              </div>
              <div>
                <p className="text-[#6b7280]">Временный пароль</p>
                <p className="font-mono font-medium text-[#050505]">{createdCredentials.password}</p>
              </div>
            </div>
            <ModalActions
              onCancel={() => setCredentialsOpen(false)}
              onConfirm={() => {
                void navigator.clipboard.writeText(
                  `TIVONIX Partners CRM\nEmail: ${createdCredentials.email}\nПароль: ${createdCredentials.password}\n\nВойдите, заполните анкету и задайте свой пароль.`
                );
                toast.success("Скопировано в буфер");
              }}
              confirmLabel="Скопировать для отправки"
              primary
            />
          </div>
        )}
      </AppModal>
    </section>
  );
}
