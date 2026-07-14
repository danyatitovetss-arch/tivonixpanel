"use client";

import { Menu, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
  showAddLead?: boolean;
  showSearch?: boolean;
  isLoading?: boolean;
  hideTitle?: boolean;
  compactTopbar?: boolean;
}

export function Topbar({
  title,
  onMenuClick,
  showAddLead = true,
  showSearch = true,
  isLoading = false,
  hideTitle = false,
  compactTopbar = false,
}: TopbarProps) {
  const { open: openAddLead } = useAddLeadSheet();

  return (
    <header
      data-app-topbar
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--color-mist-gray)] bg-[var(--color-paper-white)] px-4 md:px-6 lg:px-8",
        compactTopbar ? "h-12 lg:hidden" : "h-[var(--app-header-height)]"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 rounded-[7.5px] p-2 text-[var(--color-carbon-black)] hover:bg-[var(--color-fog-gray)] lg:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="size-5" />
        </button>
        {!hideTitle && title ? (
          <h1 className="truncate text-[19px] font-normal leading-[1.4] tracking-[-0.009em] text-[var(--color-carbon-black)] md:text-[22px] md:leading-[1.25] md:tracking-[-0.012em]">
            {title}
          </h1>
        ) : null}
        {isLoading && (
          <Loader2
            className="size-5 shrink-0 animate-spin text-[var(--color-zinc-gray)]"
            aria-label="Загрузка данных"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-zinc-gray)]" />
            <Input
              placeholder="Быстрый поиск…"
              className="h-9 w-48 rounded-[9999px] border-[var(--color-mist-gray)] bg-[var(--color-fog-gray)] pl-9 text-[13px] tracking-[-0.005em] lg:w-64"
            />
          </div>
        )}
        {showAddLead && (
          <Button type="button" onClick={openAddLead} size="sm" className="h-9 px-4">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Добавить клиента</span>
          </Button>
        )}
      </div>
    </header>
  );
}
