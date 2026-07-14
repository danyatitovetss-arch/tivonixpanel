import { formatCurrency } from "@/lib/commission";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { TrendValue } from "@/components/ui/trend-value";
import type { PartnerMonthlyTrends } from "@/lib/analytics";

interface PartnerCabinetHeroProps {
  name: string;
  balance: number;
  totalLeads: number;
  closedDeals: number;
  commissionAccrued: number;
  trends: PartnerMonthlyTrends;
  actions?: React.ReactNode;
  className?: string;
}

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[28px] font-normal leading-none tracking-[-0.02em] text-[var(--color-carbon-black)] md:text-[34px]">
        {value}
      </p>
      <p className="mt-2 text-[13px] tracking-[-0.005em] text-[var(--color-zinc-gray)] md:text-[14px]">
        {label}
      </p>
      {change !== undefined ? (
        <div className="mt-2 flex items-center gap-1.5">
          <TrendValue change={change} className="text-[12px]" />
          <span className="text-[12px] text-[var(--color-zinc-gray)]">за мес.</span>
        </div>
      ) : null}
    </div>
  );
}

export function PartnerCabinetHero({
  name,
  balance,
  totalLeads,
  closedDeals,
  commissionAccrued,
  trends,
  actions,
  className,
}: PartnerCabinetHeroProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <section className={cn("space-y-8 md:space-y-10", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <h1 className="text-[34px] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-carbon-black)] md:text-[45px] md:leading-[1.08]">
            Привет, {firstName}
          </h1>
          <p className="mt-2 text-[15px] leading-[1.45] tracking-[-0.005em] text-[var(--color-zinc-gray)] md:text-[17px]">
            {CLIENT_COPY.descriptionMy}
          </p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-[var(--color-mist-gray)] py-6 md:grid-cols-4 md:gap-x-8 md:py-8">
        <Metric
          label="Баланс к выплате"
          value={formatCurrency(balance)}
          change={trends.balance}
        />
        <Metric label={CLIENT_COPY.titleMy} value={String(totalLeads)} change={trends.leads} />
        <Metric
          label="Закрытые сделки"
          value={String(closedDeals)}
          change={trends.closedDeals}
        />
        <Metric
          label="Начислено комиссии"
          value={formatCurrency(commissionAccrued)}
          change={trends.commission}
        />
      </div>
    </section>
  );
}
