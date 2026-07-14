"use client";

import { useMemo, useState } from "react";
import type { MessageTemplate, TemplateCategory } from "@/lib/academy-data";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/academy-data";
import { TemplateCard } from "@/components/academy/template-card";
import { cn } from "@/lib/utils";

interface TemplateLibraryProps {
  templates: MessageTemplate[];
}

const FILTER_CATEGORIES: (TemplateCategory | "all")[] = [
  "all",
  "first",
  "no-site",
  "weak-site",
  "niche",
  "telegram",
  "marketplace",
  "reply",
  "followup",
  "objection",
];

export function TemplateLibrary({ templates }: TemplateLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.text.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    });
  }, [templates, search, category]);

  return (
    <div className="space-y-5">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск: цена, direct, telegram, лендинг…"
        className="h-11 w-full rounded-xl bg-[#f4f4f5] px-4 text-sm text-[#18181b] placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#18181b]/10"
      />

      <div className="flex flex-wrap gap-2">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              category === cat
                ? "bg-[var(--color-sunrise-coral)] text-white"
                : "bg-[#f4f4f5] text-[#71717a] hover:bg-[#ebebeb] hover:text-[#18181b]"
            )}
          >
            {cat === "all" ? "Все" : TEMPLATE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-[#f4f4f5] px-6 py-12 text-center text-sm text-[#71717a]">
          Шаблоны не найдены. Попробуйте другой запрос или фильтр.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
