import type { PlatformDifficultyId, PlatformDifficultyItem } from "@/lib/academy-practical-data";
import { AcademyCardBody } from "@/components/academy/academy-card";
import { faviconUrl } from "@/lib/favicon";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const lineColor: Record<PlatformDifficultyId, string> = {
  easy: "bg-emerald-500",
  hot: "bg-orange-500",
  advanced: "bg-red-500",
};

function PlatformDifficultyLink({ item }: { item: PlatformDifficultyItem }) {
  const icon = item.logoDomain ? faviconUrl(item.logoDomain, 64) : null;

  const content = (
    <>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={20} height={20} className="size-5 shrink-0 object-contain" loading="lazy" />
      ) : (
        <span className="size-5 shrink-0" />
      )}
      <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
      {item.url && <ExternalLink className="size-4 shrink-0 opacity-50" />}
    </>
  );

  if (!item.url) {
    return (
      <span className="flex items-center gap-3 text-base text-[#71717a] md:text-[17px]">{content}</span>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-base text-[#18181b] transition-colors hover:bg-white/80 md:text-[17px]"
    >
      {content}
    </a>
  );
}

export function PlatformDifficultyBlock({
  tiers,
}: {
  tiers: readonly {
    id: PlatformDifficultyId;
    level: string;
    platforms: readonly PlatformDifficultyItem[];
  }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => (
        <AcademyCardBody key={tier.id} className="relative overflow-hidden pl-6">
          <div
            className={cn("absolute bottom-0 left-0 top-0 w-1 rounded-full", lineColor[tier.id])}
            aria-hidden
          />
          <h3 className="text-base font-semibold text-[#18181b] md:text-lg">{tier.level}</h3>
          <ul className="mt-3 space-y-2">
            {tier.platforms.map((platform) => (
              <li key={platform.label}>
                <PlatformDifficultyLink item={platform} />
              </li>
            ))}
          </ul>
        </AcademyCardBody>
      ))}
    </div>
  );
}
