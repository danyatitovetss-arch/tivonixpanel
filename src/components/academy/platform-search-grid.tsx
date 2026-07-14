"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink, Globe, Search } from "lucide-react";
import type { PracticalPlatform } from "@/lib/academy-practical-data";
import { CopyButton } from "@/components/academy/copy-button";
import { PlatformQueriesModal } from "@/components/academy/platform-queries-modal";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { cn } from "@/lib/utils";

const actionButtonClass =
  "flex h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-base font-medium";

function queriesText(platform: PracticalPlatform) {
  return platform.searchQueries.join("\n");
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

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
    <section className={cn("pt-5", className)}>
      <h4 className="text-base font-semibold text-[#18181b] md:text-lg">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlatformLogo({ domains, fallback }: { domains: string[]; fallback: string }) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  if (domains.every((domain) => failed[domain])) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
        <Globe className="size-6 text-[#71717a]" />
      </div>
    );
  }

  if (domains.length === 1) {
    const domain = domains[0];
    if (failed[domain]) {
      return (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white">
          <Globe className="size-6 text-[#71717a]" />
        </div>
      );
    }
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(domain)}
          alt={fallback}
          width={36}
          height={36}
          className="size-9 object-contain"
          loading="lazy"
          onError={() => setFailed((prev) => ({ ...prev, [domain]: true }))}
        />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center">
      {domains.map((domain, index) => {
        if (failed[domain]) return null;

        return (
          <div
            key={domain}
            className="flex size-14 items-center justify-center rounded-2xl bg-white p-2.5"
            style={{ marginLeft: index > 0 ? "-0.75rem" : undefined, zIndex: domains.length - index }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconUrl(domain)}
              alt={fallback}
              width={36}
              height={36}
              className="size-9 object-contain"
              loading="lazy"
              onError={() => setFailed((prev) => ({ ...prev, [domain]: true }))}
            />
          </div>
        );
      })}
    </div>
  );
}

function PlatformCard({ platform }: { platform: PracticalPlatform }) {
  const [queriesOpen, setQueriesOpen] = useState(false);
  const preview = platform.searchQueries.slice(0, 3).join(", ");
  const restCount = Math.max(platform.searchQueries.length - 3, 0);

  return (
    <>
      <AcademyCardBody className="flex h-full min-h-0 flex-col p-0">
        <header className="shrink-0 px-5 pb-2 pt-5 md:px-6 md:pt-6">
          <div className="flex items-start gap-4">
            <PlatformLogo domains={platform.logoDomains} fallback={platform.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 text-xl font-semibold leading-tight text-[#18181b] md:text-2xl">
                  {platform.name}
                </h3>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    actionButtonClass,
                    "h-10 w-auto shrink-0 bg-[var(--color-sunrise-coral)] px-4 text-sm text-white hover:opacity-90"
                  )}
                >
                  Открыть
                  <ExternalLink className="size-4 shrink-0" />
                </a>
              </div>
              <p className="mt-3 min-h-[4.5rem] text-base leading-relaxed text-[#71717a] md:text-[17px]">
                {platform.purpose}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          {platform.whoToLookFor && (
            <SectionBlock title="Кого искать" className="px-5 md:px-6">
              <p className="text-base leading-relaxed text-[#71717a] md:text-[17px]">{platform.whoToLookFor}</p>
            </SectionBlock>
          )}

          <SectionBlock title="Что вводить в поиск" className="px-5 md:px-6">
            <button
              type="button"
              onClick={() => setQueriesOpen(true)}
              className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left transition-colors hover:bg-white/80"
            >
              <Search className="size-5 shrink-0 text-[#18181b]" />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-[#18181b] md:text-lg">
                  Выбрать запрос ({platform.searchQueries.length})
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-[#71717a] md:text-base">
                  {preview}
                  {restCount > 0 ? ` и ещё ${restCount}` : ""}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-[#9ca3af]" />
            </button>
          </SectionBlock>

          {platform.steps && (
            <SectionBlock title="Что делать" className="px-5 md:px-6">
              <ol className="space-y-2.5">
                {platform.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-base leading-relaxed text-[#71717a] md:text-[17px]">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#18181b]">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </SectionBlock>
          )}

          <SectionBlock title="Что проверить" className="flex-1 px-5 md:px-6">
            <ul className="space-y-2">
              {platform.whatToCheck.map((item) => (
                <li key={item} className="flex gap-2 text-base leading-relaxed text-[#71717a] md:text-[17px]">
                  <span className="shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionBlock>

          {platform.note && (
            <div className="px-5 py-4 md:px-6">
              <p className="rounded-2xl bg-white px-4 py-3 text-base leading-relaxed text-[#71717a] md:text-[17px]">
                {platform.note}
              </p>
            </div>
          )}
        </div>

        <footer className="mt-auto shrink-0 px-5 pb-5 pt-2 md:px-6">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setQueriesOpen(true)}
              className={cn(actionButtonClass, "bg-white hover:bg-white/80")}
            >
              <Search className="size-4 shrink-0" />
              Выбрать запрос
            </button>
            <CopyButton
              text={queriesText(platform)}
              label="Скопировать все запросы"
              toastMessage="Все запросы скопированы"
              className={cn(actionButtonClass, "bg-white hover:bg-white/80")}
            />
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(actionButtonClass, "bg-[var(--color-sunrise-coral)] text-white hover:opacity-90")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(platform.logoDomains[0])}
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 object-contain"
                loading="lazy"
              />
              <span>Открыть площадку</span>
            </a>
          </div>
        </footer>
      </AcademyCardBody>

      <PlatformQueriesModal
        open={queriesOpen}
        onOpenChange={setQueriesOpen}
        platformName={platform.name}
        queries={platform.searchQueries}
        hint={platform.queriesHint}
      />
    </>
  );
}

export function PlatformSearchGrid({ platforms }: { platforms: PracticalPlatform[] }) {
  return (
    <div className="grid auto-rows-fr items-stretch gap-5 lg:grid-cols-2">
      {platforms.map((platform) => (
        <PlatformCard key={platform.id} platform={platform} />
      ))}
    </div>
  );
}
