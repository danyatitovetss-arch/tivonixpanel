"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="overflow-hidden rounded-2xl bg-[#f6f6f6]">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-[#050505]">{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-[#6b7280] transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#ebebeb] px-5 pb-4 pt-2">
                <p className="text-sm leading-relaxed text-[#6b7280]">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
