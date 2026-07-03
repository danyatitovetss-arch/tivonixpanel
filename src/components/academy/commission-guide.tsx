"use client";

import {
  COMMISSION_EXAMPLES,
  COMMISSION_INCOME_NOTE,
  COMMISSION_INTRO,
  COMMISSION_TIERS,
} from "@/lib/academy-data";

export function CommissionGuide() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-[#6b7280] md:text-base">{COMMISSION_INTRO}</p>

      <div className="grid gap-3 sm:grid-cols-3">
        {COMMISSION_TIERS.map((tier) => (
          <div key={tier.label} className="rounded-2xl bg-[#f6f6f6] p-5">
            <p className="text-2xl font-semibold tracking-tight text-[#050505]">{tier.percent}</p>
            <p className="mt-1 text-sm font-medium text-[#050505]">{tier.label}</p>
            {tier.note && <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{tier.note}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#050505] p-5 text-white sm:p-6">
        <h3 className="text-sm font-semibold">Примеры</h3>
        <ul className="mt-4 space-y-3">
          {COMMISSION_EXAMPLES.map((ex) => (
            <li key={ex.deal} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-sm text-white/70">{ex.deal}</span>
              <span className="text-sm font-medium">{ex.payout}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm leading-relaxed text-[#6b7280] md:text-base">{COMMISSION_INCOME_NOTE}</p>
    </div>
  );
}
