"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartCarouselSlide {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface DashboardChartsCarouselProps {
  slides: ChartCarouselSlide[];
}

export function DashboardChartsCarousel({ slides }: DashboardChartsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(index, slides.length - 1));
    const slideWidth = el.clientWidth;
    el.scrollTo({ left: slideWidth * next, behavior: "smooth" });
    setActiveIndex(next);
  }, [slides.length]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  }

  if (slides.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-[#f6f6f6] p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#050505]">{slides[activeIndex]?.title}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Предыдущий график"
            className="flex size-8 items-center justify-center rounded-lg bg-white text-[#6b7280] transition-colors hover:text-[#050505] disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Следующий график"
            className="flex size-8 items-center justify-center rounded-lg bg-white text-[#6b7280] transition-colors hover:text-[#050505] disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full shrink-0 snap-center rounded-xl bg-white px-2 py-3 md:px-4"
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={slide.title}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === activeIndex ? "w-5 bg-[#050505]" : "w-1.5 bg-[#d1d5db] hover:bg-[#9ca3af]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
