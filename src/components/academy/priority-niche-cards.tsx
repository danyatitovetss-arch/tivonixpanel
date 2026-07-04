"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PriorityNiche } from "@/lib/academy-niches-detailed";
import { CopyButton } from "@/components/academy/copy-button";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { cn } from "@/lib/utils";

function SectionBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("pt-5 first:pt-0", className)}>
      <h4 className="text-base font-semibold text-[#050505] md:text-lg">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function FlatBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-white p-4 md:p-5", className)}>{children}</div>;
}

function NicheCard({
  niche,
  isOpen,
  onToggle,
}: {
  niche: PriorityNiche;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const queriesText = niche.searchQueries.join("\n");

  return (
    <AcademyCardBody>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#050505] text-sm font-semibold text-white md:size-10 md:text-base">
          {niche.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[#050505] md:text-lg">{niche.name}</h3>
            <ChevronDown
              className={cn(
                "mt-0.5 size-5 shrink-0 text-[#6b7280] transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
          <p className="mt-1 text-base leading-relaxed text-[#6b7280]">{niche.summary}</p>
        </div>
      </button>

      {isOpen && (
        <div className="mt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionBlock title="Где искать">
              <FlatBlock>
                <ul className="space-y-2">
                  {niche.whereToSearch.map((place) => (
                    <li key={place} className="flex gap-2 text-base text-[#050505]">
                      <span className="text-[#6b7280]">·</span>
                      {place}
                    </li>
                  ))}
                </ul>
              </FlatBlock>
            </SectionBlock>

            <SectionBlock title="Запросы в поиск">
              <FlatBlock>
                <ul className="space-y-2">
                  {niche.searchQueries.map((query) => (
                    <li key={query} className="flex gap-2 text-base text-[#050505]">
                      <span className="text-[#6b7280]">·</span>
                      {query}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <CopyButton
                    text={queriesText}
                    label="Скопировать запросы"
                    className="w-full sm:w-auto"
                    toastMessage="Запросы скопированы"
                  />
                </div>
              </FlatBlock>
            </SectionBlock>
          </div>

          <SectionBlock title="Пиши, если видишь">
            <FlatBlock>
              <ul className="space-y-2">
                {niche.clientSigns.map((sign) => (
                  <li key={sign} className="flex gap-2 text-base text-[#050505]">
                    <span className="shrink-0 text-[#050505]">✓</span>
                    {sign}
                  </li>
                ))}
              </ul>
            </FlatBlock>
          </SectionBlock>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <SectionBlock title="Что предложить">
              <FlatBlock>
                <ul className="space-y-3">
                  {niche.offers.map((offer) => (
                    <li key={offer.name}>
                      <p className="text-base font-medium text-[#050505]">{offer.name}</p>
                      <p className="mt-0.5 text-base leading-relaxed text-[#6b7280]">
                        {offer.benefit}
                      </p>
                    </li>
                  ))}
                </ul>
              </FlatBlock>
            </SectionBlock>

            <SectionBlock title="Боли клиента">
              <FlatBlock>
                <ul className="space-y-2">
                  {niche.pains.map((pain) => (
                    <li key={pain} className="flex gap-2 text-base text-[#050505]">
                      <span className="text-[#6b7280]">·</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </FlatBlock>
            </SectionBlock>
          </div>

          <SectionBlock title="Реалистичный результат">
            <FlatBlock>
              <p className="text-base leading-relaxed text-[#050505]">{niche.expectedResult}</p>
            </FlatBlock>
          </SectionBlock>

          <SectionBlock title="Первое сообщение" className="pt-5">
            <FlatBlock>
              <p className="whitespace-pre-line text-base leading-relaxed text-[#050505]">
                {niche.firstMessage}
              </p>
              <div className="mt-4">
                <CopyButton
                  text={niche.firstMessage}
                  label="Скопировать"
                  className="w-full sm:w-auto"
                />
              </div>
            </FlatBlock>
          </SectionBlock>
        </div>
      )}
    </AcademyCardBody>
  );
}

export function PriorityNicheCards({ niches }: { niches: PriorityNiche[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  function toggleNiche(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {niches.map((niche) => (
        <NicheCard
          key={niche.id}
          niche={niche}
          isOpen={openIds.has(niche.id)}
          onToggle={() => toggleNiche(niche.id)}
        />
      ))}
    </div>
  );
}
