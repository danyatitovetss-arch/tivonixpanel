"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, RefreshCw } from "lucide-react";
import { exportUserCredentialsPdf } from "@/lib/export-user-credentials-pdf";
import { AppModal, ModalActions, ModalField, fieldClass } from "@/components/ui/app-modal";
import { useApp } from "@/lib/store";
import { isDemoMode } from "@/lib/demo-mode";
import { fetchJson } from "@/lib/api/fetch-json";
import { toUserMessage } from "@/lib/errors";
import type { UserRole } from "@/lib/types";
import { getOnboardingStatusLabel, getUserRoleLabel } from "@/lib/statuses";

type CreatedCredentials = {
  email: string;
  password: string;
  name: string;
  roleLabel: string;
};
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
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
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

  async function downloadCredentialsPdf(credentials: CreatedCredentials) {
    setPdfLoading(true);
    try {
      await exportUserCredentialsPdf({
        fullName: credentials.name,
        email: credentials.email,
        password: credentials.password,
        roleLabel: credentials.roleLabel,
        loginUrl: `${window.location.origin}/login`,
      });
      toast.success("PDF скачан");
    } catch (err) {
      toast.error(toUserMessage(err, "Не удалось сформировать PDF"));
    } finally {
      setPdfLoading(false);
    }
  }

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
        partnerType: form.role === "partner" ? "referral" : null,
        agencyName: null,
        websiteUrl: null,
        commissionPercentOverride: null,
        assignedManagerId: null,
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

      const createdRole = form.role === "admin" ? "partner" : form.role;
      const credentials: CreatedCredentials = {
        email: result.data.email,
        password: result.data.temporaryPassword,
        name: result.data.fullName,
        roleLabel: getUserRoleLabel(createdRole),
      };

      setCreatedCredentials(credentials);
      setForm({ name: "", email: "", telegram: "", password: generatePassword(), role: "partner" });
      setOpen(false);
      setCredentialsOpen(true);
      await loadUsers();
      toast.success("Партнёр создан");
      void downloadCredentialsPdf(credentials);
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
          <h2 className="text-lg font-semibold text-[#18181b]">Пользователи</h2>
          <p className="text-sm text-[#71717a]">
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
              <OkxTd colSpan={4} className="text-[#71717a]">
                Загрузка…
              </OkxTd>
            </OkxTr>
          ) : rows.length === 0 ? (
            <OkxTr interactive={false}>
              <OkxTd colSpan={4} className="text-[#71717a]">
                Пользователей пока нет — нажмите «Добавить партнёра»
              </OkxTd>
            </OkxTr>
          ) : (
            rows.map((u) => (
              <OkxTr key={u.id} interactive={false}>
                <OkxTd>
                  <OkxCellPrimary title={u.fullName ?? "—"} subtitle={u.email ?? "—"} />
                </OkxTd>
                <OkxTd className="text-[#71717a]">{getUserRoleLabel(u.role)}</OkxTd>
                <OkxTd className="text-[#71717a]">
                  {getOnboardingStatusLabel(u.onboardingStatus)}
                  {u.crmAccess ? " · CRM" : ""}
                </OkxTd>
                <OkxTd className="text-[#71717a]">{u.status === "active" ? "Активен" : "Неактивен"}</OkxTd>
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
                className="shrink-0 rounded-xl border border-[#e4e4e7] px-3 text-xs font-medium text-[#71717a] hover:bg-[#fafafa]"
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
            <div className="space-y-3 rounded-xl bg-[#f4f4f5] p-4 text-sm">
              <div>
                <p className="text-[#71717a]">Email</p>
                <p className="font-medium text-[#18181b]">{createdCredentials.email}</p>
              </div>
              <div>
                <p className="text-[#71717a]">Временный пароль</p>
                <p className="font-mono font-medium text-[#18181b]">{createdCredentials.password}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={pdfLoading}
                onClick={() => void downloadCredentialsPdf(createdCredentials)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e4e4e7] text-sm font-medium text-[#18181b] transition-colors hover:bg-[#fafafa] disabled:opacity-50"
              >
                <Download className="size-4" />
                {pdfLoading ? "Формирование…" : "Скачать PDF"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `TIVONIX Partners CRM\nВход: ${window.location.origin}/login\nEmail: ${createdCredentials.email}\nПароль: ${createdCredentials.password}\n\nВойдите, заполните анкету и задайте свой пароль.`
                  );
                  toast.success("Скопировано в буфер");
                }}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-sunrise-coral)] text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Скопировать текст
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCredentialsOpen(false)}
              className="w-full text-center text-sm text-[#71717a] hover:text-[#18181b]"
            >
              Закрыть
            </button>
          </div>
        )}
      </AppModal>
    </section>
  );
}
