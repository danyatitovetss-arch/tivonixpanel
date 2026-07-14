import type { MarketplacePlatform } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";
import { ExternalLink } from "lucide-react";

interface MarketplaceListProps {
  platforms: MarketplacePlatform[];
  keywords: string[];
  howTo: string[];
  responseTemplate: string;
}

export function MarketplaceList({
  platforms,
  keywords,
  howTo,
  responseTemplate,
}: MarketplaceListProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-[#71717a]">
        На биржах нужно соблюдать правила площадки. Не уводи клиента в обход правил, если это
        запрещено. Используй биржи как источник спроса: какие задачи появляются, какие формулировки
        используют клиенты.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {platforms.map((platform) => (
          <div key={platform.id} className="rounded-2xl bg-[#f4f4f5] p-5">
            <h3 className="font-semibold text-[#18181b]">{platform.name}</h3>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#18181b] underline-offset-2 hover:underline"
              >
                {platform.url.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-3.5" />
              </a>
              {platform.jobsUrl && (
                <a
                  href={platform.jobsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#71717a] underline-offset-2 hover:underline"
                >
                  Проекты / jobs
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Что искать</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span key={kw} className="rounded-lg bg-white px-3 py-1.5 text-xs text-[#18181b]">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Как использовать</p>
        <ol className="mt-3 space-y-2">
          {howTo.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-[#18181b]">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Шаблон отклика</p>
        <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{responseTemplate}</p>
        <div className="mt-4">
          <CopyButton text={responseTemplate} label="Скопировать отклик" className="w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
