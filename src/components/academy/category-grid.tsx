"use client";

import { useMemo, useState } from "react";
import type { BusinessCategory } from "@/lib/academy-data";
import { CategoryCard } from "@/components/academy/category-card";

interface CategoryGridProps {
  categories: BusinessCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.offers.some((o) => o.toLowerCase().includes(q)) ||
        c.signs.some((s) => s.toLowerCase().includes(q))
    );
  }, [categories, search]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск ниши: салон, ремонт, стоматология…"
        className="h-11 w-full rounded-xl border-0 bg-[#f4f4f5] px-4 text-sm text-[#18181b] placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#18181b]/10"
      />

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-[#f4f4f5] px-6 py-10 text-center text-sm text-[#71717a]">
          Ниши не найдены. Попробуйте другой запрос.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((category, i) => (
            <CategoryCard key={category.id} category={category} defaultOpen={i === 0 && !search} />
          ))}
        </div>
      )}

      <p className="text-sm text-[#71717a]">
        Всего категорий: {categories.length}. Начни с одной ниши — не распыляйся.
      </p>
    </div>
  );
}
