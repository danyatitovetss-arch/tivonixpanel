import { ExternalLink } from "lucide-react";
import { faviconUrlFromHref } from "@/lib/favicon";

export function QuickLinksGrid({ links }: { links: { label: string; url: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => {
        const icon = faviconUrlFromHref(link.url, 64);
        return (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4f4f5] px-4 text-sm font-medium text-[#18181b] hover:bg-[#ebebeb]"
          >
            {icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" width={16} height={16} className="size-4 object-contain" loading="lazy" />
            )}
            {link.label}
            <ExternalLink className="size-3.5 shrink-0 opacity-60" />
          </a>
        );
      })}
    </div>
  );
}
