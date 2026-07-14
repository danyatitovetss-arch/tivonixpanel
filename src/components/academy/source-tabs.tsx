"use client";

import { useState } from "react";
import type { AcademySource } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

interface SourceTabsProps {
  sources: AcademySource[];
}

export function SourceTabs({ sources }: SourceTabsProps) {
  const [active, setActive] = useState(sources[0]?.id ?? "");

  const current = sources.find((s) => s.id === active) ?? sources[0];

  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => setActive(source.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active === source.id
                ? "bg-[var(--color-sunrise-coral)] text-white"
                : "bg-white/60 text-[#71717a] hover:bg-white hover:text-[#18181b]"
            )}
          >
            {source.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="mt-5 rounded-xl bg-white p-5">
          <p className="text-sm leading-relaxed text-[#71717a]">{current.intro}</p>
          <ol className="mt-4 space-y-2">
            {current.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-[#18181b]">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f4f4f5] text-xs font-medium text-[#71717a]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {current.examples && (
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Примеры запросов</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {current.examples.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-lg bg-[#f4f4f5] px-3 py-1.5 text-xs text-[#18181b]"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}
          {current.note && (
            <p className="mt-4 text-sm text-[#71717a]">{current.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
