"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/access/role-guard";
import { getOnboardingStatusLabel, getPayoutAdminStatusLabel } from "@/lib/statuses";

type LegalRow = {
  user_id: string;
  full_name: string;
  email: string;
  telegram: string | null;
  age: number | null;
  country: string | null;
  partner_legal_status: string;
  unp: string | null;
  onboarding_status: string;
  crm_access: boolean;
  payout_status: string;
  profile?: { created_at: string };
};

export default function AdminLegalProfilesPage() {
  const [rows, setRows] = useState<LegalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/legal-profiles")
      .then((r) => r.json())
      .then((json) => {
        setRows(json.data ?? []);
        setLoading(false);
      });
  }, []);

  async function action(userId: string, path: string) {
    await fetch(`/api/admin/legal-profiles/${userId}/${path}`, { method: "POST" });
    const res = await fetch("/api/admin/legal-profiles");
    const json = await res.json();
    setRows(json.data ?? []);
  }

  return (
    <RoleGuard resource="admin" redirectTo="/dashboard">
      <AppLayout title="Юр. профили">
        <div className="overflow-x-auto rounded-xl border border-[#e4e4e7]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f4f4f5] text-left text-[#71717a]">
              <tr>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Возраст</th>
                <th className="px-4 py-3">Оформление</th>
                <th className="px-4 py-3">CRM</th>
                <th className="px-4 py-3">Выплаты</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-[#71717a]">
                    Загрузка…
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.user_id} className="border-t border-[#e4e4e7]">
                    <td className="px-4 py-3">{row.full_name}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.age ?? "—"}</td>
                    <td className="px-4 py-3">{getOnboardingStatusLabel(row.onboarding_status)}</td>
                    <td className="px-4 py-3">{row.crm_access ? "да" : "нет"}</td>
                    <td className="px-4 py-3">{getPayoutAdminStatusLabel(row.payout_status)}</td>
                    <td className="space-x-2 px-4 py-3">
                      <button
                        type="button"
                        className="underline"
                        onClick={() => action(row.user_id, "approve-payouts")}
                      >
                        Одобрить выплаты
                      </button>
                      <button
                        type="button"
                        className="underline text-red-600"
                        onClick={() => action(row.user_id, "block-user")}
                      >
                        Блок
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
