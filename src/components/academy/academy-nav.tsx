"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ACADEMY_SECTIONS } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

interface AcademyNavProps {
  activeSection: string;
  onSelect: (id: string) => void;
}

export function getAcademyScrollOffset(): number {
  if (typeof window === "undefined") return 72;
  const style = getComputedStyle(document.documentElement);
  const raw = style.getPropertyValue("--academy-scroll-offset").trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 72;
}

export function AcademyNav({ activeSection, onSelect }: AcademyNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const activeLabel =
    ACADEMY_SECTIONS.find((s) => s.id === activeSection)?.label ?? "Старт";

  useEffect(() => {
    function syncNavHeight() {
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      const height =
        mobile && mobileBarRef.current ? mobileBarRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty("--academy-nav-height", `${height}px`);
    }

    syncNavHeight();
    window.addEventListener("resize", syncNavHeight);

    const observer = new ResizeObserver(syncNavHeight);
    if (mobileBarRef.current) observer.observe(mobileBarRef.current);

    return () => {
      window.removeEventListener("resize", syncNavHeight);
      observer.disconnect();
      document.documentElement.style.setProperty("--academy-nav-height", "0px");
    };
  }, []);

  function handleSelect(id: string) {
    onSelect(id);
    setSheetOpen(false);
  }

  return (
    <>
      {/* Mobile: фиксированная панель под хедером — не уезжает при скролле */}
      <div
        ref={mobileBarRef}
        data-academy-nav-mobile
        className="fixed inset-x-0 top-[var(--app-header-height)] z-20 border-b border-[#ebebeb] bg-white px-4 py-2 lg:hidden md:px-6"
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl bg-[#f6f6f6] px-4 py-3 text-left"
          aria-label="Выбрать раздел"
        >
          <List className="size-4 shrink-0 text-[#6b7280]" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-[#9ca3af]">Раздел</span>
            <span className="block truncate text-sm font-medium text-[#050505]">
              {activeLabel}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-[#6b7280]" />
        </button>
      </div>

      {/* Отступ под фиксированную панель на мобилке */}
      <div
        className="shrink-0 lg:hidden"
        style={{ height: "max(4.25rem, var(--academy-nav-height, 4.25rem))" }}
        aria-hidden
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[min(85dvh,640px)] rounded-t-2xl border-0 p-0"
        >
          <div className="border-b border-[#ebebeb] px-5 py-4">
            <h3 className="text-base font-semibold text-[#050505]">Разделы</h3>
            <p className="mt-0.5 text-sm text-[#6b7280]">Перейти к нужному блоку</p>
          </div>
          <ul className="overflow-y-auto overscroll-contain p-3 pb-8">
            {ACADEMY_SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(section.id)}
                  className={cn(
                    "mb-1 w-full rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-[#050505] text-white"
                      : "text-[#050505] hover:bg-[#f6f6f6]"
                  )}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* Desktop: sticky в grid-колонке (self-start обязателен) */}
      <nav
        data-academy-nav-desktop
        className="sticky top-[var(--app-header-height)] z-20 hidden max-h-[calc(100dvh-var(--app-header-height))] self-start overflow-y-auto overscroll-contain rounded-2xl bg-[#f6f6f6] p-3 lg:block"
      >
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
          Разделы
        </p>
        <ul className="space-y-1">
          {ACADEMY_SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleSelect(section.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-[#050505] text-white"
                    : "text-[#6b7280] hover:bg-white hover:text-[#050505]"
                )}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
