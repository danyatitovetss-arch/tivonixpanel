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
    <div
      className={cn(
        "flex items-center gap-5 rounded-2xl bg-[#f6f6f6] px-6 py-8 md:gap-6 md:px-8 md:py-10",
        className
      )}
    >
      {spinning && (
        <div className="relative flex size-16 shrink-0 items-center justify-center md:size-20">
          <svg
            className="size-full animate-spin"
            viewBox="0 0 80 80"
            fill="none"
            aria-hidden
          >
            <circle cx="40" cy="40" r="34" stroke="#e5e5e5" strokeWidth="3" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#050505"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60 154"
            />
          </svg>
        </div>
      )}

      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-[#050505] md:text-4xl">
          {title}
        </p>
        {subtitle && (
          <p className="mt-2 text-sm text-[#6b7280] md:text-base">{subtitle}</p>
        )}
        {hint && (
          <p className="mt-1 text-sm text-[#9ca3af]">{hint}</p>
        )}
      </div>
    </div>
  );
}
