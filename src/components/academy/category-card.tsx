"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { BusinessCategory } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: BusinessCategory;
  defaultOpen?: boolean;
}

function ListColumn({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[#18181b]">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
              <Check className="size-3 text-[#71717a]" strokeWidth={2.5} />
            </span>
            <span className={muted ? "text-[#71717a]" : "text-[#18181b]"}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryCard({ category, defaultOpen = false }: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#f4f4f5]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#18181b]">{category.name}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-[#71717a] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t border-[#ebebeb] px-5 pb-5 pt-4">
          <div className="grid gap-5 md:grid-cols-2">
            <ListColumn title="Можно предложить" items={category.offers} />
            <ListColumn title="Признаки" items={category.signs} muted />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#18181b]">Где искать</h4>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {category.whereToSearch.map((w) => (
                <span
                  key={w}
                  className="rounded-lg bg-white px-2.5 py-2 text-center text-xs text-[#18181b] sm:text-left"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4">
            <h4 className="text-sm font-semibold text-[#18181b]">Стартовый шаблон</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{category.starterTemplate}</p>
            <div className="mt-3">
              <CopyButton text={category.starterTemplate} label="Скопировать" className="w-full sm:w-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
