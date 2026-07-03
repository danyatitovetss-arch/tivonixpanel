"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/access/role-guard";

type AuditRow = {
  id: string;
  actor_profile_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  old_value: unknown;
  new_value: unknown;
};

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);

  useEffect(() => {
    void fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((json) => setRows(json.data ?? []));
  }, []);

  return (
    <RoleGuard resource="admin" redirectTo="/dashboard">
      <AppLayout title="Журнал действий">
        <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f6f6f6] text-left text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Действие</th>
                <th className="px-4 py-3">Объект</th>
                <th className="px-4 py-3">ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#e5e5e5]">
                  <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("ru-RU")}</td>
                  <td className="px-4 py-3">{row.action}</td>
                  <td className="px-4 py-3">{row.entity_type}</td>
                  <td className="px-4 py-3">{row.entity_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
