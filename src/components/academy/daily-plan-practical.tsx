"use client";

import { useState } from "react";
import type { DailyPlanLevel } from "@/lib/academy-practical-data";
import { DAILY_CHECKLIST_STORAGE_KEY } from "@/lib/academy-practical-data";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { Checkbox } from "@/components/ui/checkbox";

interface DailyPlanPracticalProps {
  levels: DailyPlanLevel[];
  checklistItems: string[];
}

export function DailyPlanPractical({ levels, checklistItems }: DailyPlanPracticalProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(DAILY_CHECKLIST_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
    } catch {
      return {};
    }
  });

  function toggle(index: number) {
    setChecked((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      try {
        localStorage.setItem(DAILY_CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {levels.map((level) => (
          <AcademyCardBody key={level.title}>
            <h3 className="font-semibold text-[#18181b]">{level.title}</h3>
            <ul className="mt-3 space-y-2">
              {level.items.map((item) => (
                <li key={item} className="text-sm text-[#71717a]">
                  · {item}
                </li>
              ))}
            </ul>
          </AcademyCardBody>
        ))}
      </div>

      <AcademyCardBody>
        <h3 className="font-semibold text-[#18181b]">Чеклист на сегодня</h3>
        <p className="mt-1 text-sm text-[#71717a]">Отмечай пункты — прогресс сохраняется в браузере.</p>
        <ul className="mt-4 space-y-3">
          {checklistItems.map((item, index) => (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#18181b]">
                <Checkbox checked={!!checked[index]} onCheckedChange={() => toggle(index)} />
                {item}
              </label>
            </li>
          ))}
        </ul>
      </AcademyCardBody>
    </div>
  );
}
