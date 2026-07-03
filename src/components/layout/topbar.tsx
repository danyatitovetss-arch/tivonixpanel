"use client";

import { Menu, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
  showAddLead?: boolean;
  showSearch?: boolean;
  isLoading?: boolean;
}

export function Topbar({
  title,
  onMenuClick,
  showAddLead = true,
  showSearch = true,
  isLoading = false,
}: TopbarProps) {
  const { open: openAddLead } = useAddLeadSheet();

  return (
    <header className="sticky top-0 z-30 flex h-[var(--app-header-height)] items-center justify-between gap-4 bg-white px-4 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-[#050505] hover:bg-[#f6f6f6] lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="truncate text-lg font-semibold tracking-tight text-[#050505] md:text-xl">
          {title}
        </h1>
        {isLoading && (
          <Loader2 className="size-5 shrink-0 animate-spin text-[#6b7280]" aria-label="Загрузка данных" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]" />
            <Input
              placeholder="Быстрый поиск…"
              className="h-9 w-48 rounded-xl border-[#e5e5e5] bg-[#fafafa] pl-9 text-sm lg:w-64"
            />
          </div>
        )}
        {showAddLead && (
          <Button
            type="button"
            onClick={openAddLead}
            className="h-9 rounded-xl bg-[#050505] px-4 text-sm hover:bg-[#050505]/90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Добавить клиента</span>
          </Button>
        )}
      </div>
    </header>
  );
}
