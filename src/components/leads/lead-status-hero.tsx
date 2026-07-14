"use client";

import type { Lead } from "@/lib/types";
import { PARTNER_STATUS_HELP } from "@/lib/lead-help";
import { getLeadStatusLabel, ADMIN_REVIEW_LABELS } from "@/lib/statuses";
import { cn } from "@/lib/utils";

function getHeroConfig(lead: Lead) {
  const isReviewing =
    lead.status === "pending_review" && lead.adminReviewStatus === "pending";

  if (isReviewing) {
    return {
      title: "Проверяют",
      subtitle: undefined,
      hint: undefined,
      spinning: true,
    };
  }

  const help = PARTNER_STATUS_HELP[lead.status];
  const reviewLabel =
    lead.status === "pending_review"
      ? ADMIN_REVIEW_LABELS[lead.adminReviewStatus]
      : undefined;
  return {
    title: help?.title ?? getLeadStatusLabel(lead.status),
    subtitle: lead.nextAction || reviewLabel,
    hint: help?.hint,
    spinning: false,
  };
}

export function LeadStatusHero({ lead, className }: { lead: Lead; className?: string }) {
  const { title, subtitle, hint, spinning } = getHeroConfig(lead);

  return (
    <div className={cn("flex items-start gap-5 py-1 md:gap-6", className)}>
      {spinning && (
        <div className="relative flex size-14 shrink-0 items-center justify-center md:size-16">
          <svg
            className="size-full animate-spin"
            viewBox="0 0 80 80"
            fill="none"
            aria-hidden
          >
            <circle cx="40" cy="40" r="34" stroke="var(--color-mist-gray)" strokeWidth="3" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="var(--color-sunrise-coral)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60 154"
            />
          </svg>
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--color-carbon-black)] md:text-[34px]">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-2 text-[15px] tracking-[-0.005em] text-[var(--color-zinc-gray)]">
            {subtitle}
          </p>
        ) : null}
        {hint ? (
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-[var(--color-ash-gray)]">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
