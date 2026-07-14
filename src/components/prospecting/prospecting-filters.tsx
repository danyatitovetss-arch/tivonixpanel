"use client";

import { FilterSelect } from "@/components/ui/filter-select";
import { PROSPECT_NICHES, PROSPECT_SOURCES } from "@/lib/prospecting-data";
import { PROSPECT_PRIORITY_LABELS, PROSPECT_STATUS_LABELS } from "@/lib/prospecting-data";
import type { ProspectStatus } from "@/lib/prospecting-types";

export interface ProspectFiltersState {
  search: string;
  status: string;
  niche: string;
  source: string;
  city: string;
  priority: string;
  followUpToday: boolean;
  noWebsite: boolean;
  badWebsite: boolean;
}

interface ProspectingFiltersProps {
  filters: ProspectFiltersState;
  cities: string[];
  onChange: (patch: Partial<ProspectFiltersState>) => void;
  open: boolean;
  onToggle: () => void;
}

export function ProspectingFilters({
  filters,
  cities,
  onChange,
  open,
  onToggle,
}: ProspectingFiltersProps) {
  const statusOptions = (Object.keys(PROSPECT_STATUS_LABELS) as ProspectStatus[]).map((s) => ({
    value: s,
    label: PROSPECT_STATUS_LABELS[s],
  }));

  const nicheOptions = PROSPECT_NICHES.map((n) => ({ value: n, label: n }));
  const sourceOptions = PROSPECT_SOURCES.map((s) => ({ value: s, label: s }));
  const cityOptions = cities.map((c) => ({ value: c, label: c }));
  const priorityOptions = Object.entries(PROSPECT_PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Поиск: название, сайт, Instagram, телефон…"
          className="h-11 flex-1 rounded-xl border-0 bg-[#f4f4f5] px-4 text-sm text-[#18181b] outline-none transition-colors placeholder:text-[#9ca3af] focus:bg-[#f4f4f5]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="h-11 shrink-0 rounded-xl bg-[#f4f4f5] px-4 text-sm font-medium text-[#18181b] lg:hidden"
        >
          {open ? "Скрыть фильтры" : "Фильтры"}
        </button>
      </div>

      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-5 ${open ? "grid" : "hidden lg:grid"}`}>
        <FilterSelect
          value={filters.status}
          onChange={(v) => onChange({ status: v })}
          options={statusOptions}
          placeholder="Все статусы"
        />
        <FilterSelect
          value={filters.niche}
          onChange={(v) => onChange({ niche: v })}
          options={nicheOptions}
          placeholder="Все ниши"
        />
        <FilterSelect
          value={filters.source}
          onChange={(v) => onChange({ source: v })}
          options={sourceOptions}
          placeholder="Все источники"
        />
        <FilterSelect
          value={filters.city}
          onChange={(v) => onChange({ city: v })}
          options={cityOptions}
          placeholder="Все города"
        />
        <FilterSelect
          value={filters.priority}
          onChange={(v) => onChange({ priority: v })}
          options={priorityOptions}
          placeholder="Любой приоритет"
        />
      </div>

      <div className={`flex flex-wrap gap-2 ${open ? "flex" : "hidden lg:flex"}`}>
        {[
          { key: "followUpToday" as const, label: "Нужен повтор сегодня" },
          { key: "noWebsite" as const, label: "Без сайта" },
          { key: "badWebsite" as const, label: "Слабый сайт" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#f4f4f5] px-3 py-2 text-xs font-medium text-[#18181b]"
          >
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => onChange({ [key]: e.target.checked })}
              className="size-3.5 rounded border-[#d1d5db]"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
