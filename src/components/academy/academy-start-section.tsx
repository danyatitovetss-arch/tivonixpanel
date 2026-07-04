"use client";

import { START_SUBTITLE, START_WORKFLOW } from "@/lib/academy-practical-data";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { CopyButton } from "@/components/academy/copy-button";

interface AcademyStartSectionProps {
  universalMessage: string;
  onFindClients: () => void;
  onAddLead: () => void;
  onPayouts: () => void;
}

export function AcademyStartSection({
  universalMessage,
  onFindClients,
  onAddLead,
  onPayouts,
}: AcademyStartSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-[#6b7280] md:text-base">{START_SUBTITLE}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={onFindClients}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#050505] px-5 text-sm font-medium text-white hover:bg-[#262626]"
          >
            Найти клиентов
          </button>
          <CopyButton
            text={universalMessage}
            label="Скопировать сообщение"
            className="h-12 w-full rounded-full sm:w-full"
          />
          <button
            type="button"
            onClick={onAddLead}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] hover:bg-[#ebebeb]"
          >
            Добавить лида
          </button>
          <button
            type="button"
            onClick={onPayouts}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] hover:bg-[#ebebeb]"
          >
            Условия выплат
          </button>
        </div>
      </div>

      <AcademyCardBody>
        <h3 className="text-sm font-semibold text-[#050505]">Схема работы</h3>
        <ol className="mt-4 space-y-2.5">
          {START_WORKFLOW.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-[#050505]">
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
