"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { SearchSource } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";
import { cn } from "@/lib/utils";

interface SearchSourcesTabsProps {
  sources: SearchSource[];
}

function SourceSection({
  title,
  children,
  first,
}: {
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div className={cn(!first && "border-t border-[#ebebeb] pt-5")}>
      <h4 className="text-sm font-semibold text-[#18181b]">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function BulletGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-[#18181b]">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
            <Check className="size-3 text-[#71717a]" strokeWidth={2.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-lg bg-white px-2.5 py-1 text-xs text-[#18181b]">
          {item}
        </span>
      ))}
    </div>
  );
}

function SourceContent({ source }: { source: SearchSource }) {
  return (
    <article className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
      {source.title && (
        <h3 className="text-base font-semibold text-[#18181b]">{source.title}</h3>
      )}
      <p className={cn("text-sm leading-relaxed text-[#71717a]", source.title && "mt-2")}>
        {source.intro}
      </p>

      <div className="mt-5 space-y-5">
        <SourceSection title="Инструкция" first>
          <ol className="space-y-2.5">
            {source.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-[#18181b]">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </SourceSection>

        {source.lookFor && source.lookFor.length > 0 && (
          <SourceSection title="Что искать">
            <BulletGrid items={source.lookFor} />
          </SourceSection>
        )}

        {source.profileChecks && source.profileChecks.length > 0 && (
          <SourceSection title="Что смотреть в профиле">
            <BulletGrid items={source.profileChecks} />
          </SourceSection>
        )}

        {source.whereToFind && source.whereToFind.length > 0 && (
          <SourceSection title="Где искать">
            <TagList items={source.whereToFind} />
          </SourceSection>
        )}

        {source.whatTheyNeed && source.whatTheyNeed.length > 0 && (
          <SourceSection title="Что им нужно">
            <BulletGrid items={source.whatTheyNeed} />
          </SourceSection>
        )}

        {source.examples && source.examples.length > 0 && (
          <SourceSection title="Примеры запросов">
            <TagList items={source.examples} />
          </SourceSection>
        )}

        {source.canWrite && source.canWrite.length > 0 && (
          <SourceSection title="Что можно писать">
            <div className="space-y-2">
              {source.canWrite.map((item) => (
                <p key={item} className="rounded-xl bg-white p-4 text-sm leading-relaxed text-[#71717a]">
                  {item}
                </p>
              ))}
            </div>
          </SourceSection>
        )}

        {source.cannotDo && source.cannotDo.length > 0 && (
          <SourceSection title="Что нельзя">
            <ul className="space-y-2">
              {source.cannotDo.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#18181b]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                    <X className="size-3 text-[#71717a]" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </SourceSection>
        )}

        {source.template && (
          <SourceSection title="Шаблон">
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm leading-relaxed text-[#71717a]">{source.template}</p>
              <div className="mt-3">
                <CopyButton text={source.template} label="Скопировать" className="w-full sm:w-auto" />
              </div>
            </div>
          </SourceSection>
        )}

        {source.note && (
          <p className="border-t border-[#ebebeb] pt-5 text-sm text-[#71717a]">{source.note}</p>
        )}

        {source.strategy && (
          <p className="rounded-xl bg-white p-4 text-sm leading-relaxed text-[#71717a]">
            {source.strategy}
          </p>
        )}
      </div>
    </article>
  );
}

export function SearchSourcesTabs({ sources }: SearchSourcesTabsProps) {
  const [active, setActive] = useState(sources[0]?.id ?? "");

  const current = sources.find((s) => s.id === active) ?? sources[0];
  if (!current) return null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(180px,220px)_1fr] lg:items-start lg:gap-4">
      <nav
        aria-label="Источники поиска"
        className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#f4f4f5] p-2 sm:grid-cols-4 lg:sticky lg:top-[var(--academy-scroll-offset)] lg:grid-cols-1 lg:self-start"
      >
        {sources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => setActive(source.id)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-left text-xs font-medium leading-snug transition-colors sm:text-sm lg:py-2.5",
              active === source.id
                ? "bg-[var(--color-sunrise-coral)] text-white"
                : "text-[#71717a] hover:bg-white hover:text-[#18181b]"
            )}
          >
            {source.label}
          </button>
        ))}
      </nav>

      <SourceContent source={current} />
    </div>
  );
}
