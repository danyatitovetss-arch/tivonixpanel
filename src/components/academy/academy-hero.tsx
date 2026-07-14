"use client";

import { ACADEMY_WORKFLOW, HERO_DESCRIPTION } from "@/lib/academy-data";
import { AcademyCardBody } from "@/components/academy/academy-card";

interface AcademyHeroProps {
  onAddClient: () => void;
  onCheckDuplicate: () => void;
  onOpenTemplates: () => void;
  onOpenPlan: () => void;
}

export function AcademyHero({
  onAddClient,
  onCheckDuplicate,
  onOpenTemplates,
  onOpenPlan,
}: AcademyHeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-[#71717a] md:text-base">{HERO_DESCRIPTION}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={onAddClient}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-sunrise-coral)] px-5 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Добавить клиента
          </button>
          <button
            type="button"
            onClick={onCheckDuplicate}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f4f4f5] px-5 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
          >
            Проверить дубль
          </button>
          <button
            type="button"
            onClick={onOpenTemplates}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f4f4f5] px-5 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
          >
            Открыть шаблоны
          </button>
          <button
            type="button"
            onClick={onOpenPlan}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#f4f4f5] px-5 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
          >
            План на 1 час
          </button>
        </div>
      </div>

      <AcademyCardBody>
        <h3 className="text-sm font-semibold text-[#18181b]">Простая схема работы</h3>
        <ol className="mt-4 space-y-2.5">
          {ACADEMY_WORKFLOW.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-[#18181b]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">
                {i + 1}
              </span>
              <span className="pt-1 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </AcademyCardBody>
    </section>
  );
}
