"use client";

import { useMemo, useState } from "react";
import type { MessageTemplate, TemplateCategory } from "@/lib/academy-data";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/academy-data";
import { TemplateCard } from "@/components/academy/template-card";
import { cn } from "@/lib/utils";

interface TemplatesSectionProps {
  templates: MessageTemplate[];
}

export function TemplatesSection({ templates }: TemplatesSectionProps) {
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

  const categories: (TemplateCategory | "all")[] = ["all", "first", "niche", "reply", "followup"];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск: салон, цена, telegram…"
          className="h-11 flex-1 rounded-xl border-0 bg-[#f4f4f5] px-4 text-sm text-[#18181b] placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#18181b]/10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
          Шаблоны не найдены. Попробуйте другой запрос.
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
