"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { StartChecklistItem, StartStep } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

interface StartGuideProps {
  intro: string;
  steps: StartStep[];
  checklist: StartChecklistItem[];
}

export function StartGuide({ intro, steps, checklist }: StartGuideProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[#6b7280] md:text-base">{intro}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-2xl bg-[#f6f6f6] p-5">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#050505]">
              {i + 1}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-[#050505]">{step.title}</h3>
            <p className="mt-1.5 text-sm text-[#6b7280]">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#f6f6f6] p-5 md:p-6">
        <h3 className="text-sm font-semibold text-[#050505]">Мини-чеклист новичка</h3>
        <ul className="mt-4 space-y-2">
          {checklist.map((item, index) => {
            const id = String(index);
            const done = checked[id];
            return (
              <li key={item.text}>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/60"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      done ? "border-[#050505] bg-[#050505] text-white" : "border-[#d1d5db] bg-white"
                    )}
                  >
                    {done && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className={cn("text-sm", done ? "text-[#9ca3af] line-through" : "text-[#050505]")}>
                    {item.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
