"use client";

import { useApp } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectFieldText,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { getUserRoleLabel } from "@/lib/statuses";
import { isDemoMode } from "@/lib/demo-mode";

export function RoleSwitcher() {
  const { data, currentUser, setCurrentUserId } = useApp();
  if (!isDemoMode()) return null;

  const userOptions = data.users
    .filter((u) => u.status === "active")
    .map((u) => ({
      value: u.id,
      label: `${u.name} (${getUserRoleLabel(u.role)})`,
    }));

  return (
    <div className="px-3 pb-3">
      <p className="mb-2 px-2 text-xs text-white/40">Demo: переключить роль</p>
      <Select value={currentUser.id} onValueChange={(v) => v && setCurrentUserId(v)}>
        <SelectTrigger className="h-9 rounded-xl border-white/10 bg-white/5 text-sm text-white">
          <SelectFieldText
            value={currentUser.id}
            placeholder="Выберите пользователя"
            options={userOptions}
            className="text-white"
          />
        </SelectTrigger>
        <SelectContent>
          {userOptions.map((u) => (
            <SelectItem key={u.value} value={u.value}>
              {u.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
