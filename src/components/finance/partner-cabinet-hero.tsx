import { MetricCard } from "@/components/finance/balance-card";
import { CLIENT_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import type { PartnerMonthlyTrends } from "@/lib/analytics";

interface PartnerCabinetHeroProps {
  name: string;
  balance: number;
  totalLeads: number;
  closedDeals: number;
  commissionAccrued: number;
  trends: PartnerMonthlyTrends;
  className?: string;
}

export function PartnerCabinetHero({
  name,
  balance,
  totalLeads,
  closedDeals,
  commissionAccrued,
  trends,
  className,
}: PartnerCabinetHeroProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <section className={cn("rounded-2xl bg-[#f6f6f6] p-5 md:p-8", className)}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
        <div className="min-w-0 shrink-0 xl:max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight text-[#050505] md:text-4xl">
            Привет, {firstName}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#6b7280] md:text-lg">
            {CLIENT_COPY.descriptionMy}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <MetricCard
            label="Баланс к выплате"
            value={balance}
            format="currency"
            change={trends.balance}
            variant="inset"
          />
          <MetricCard
            label={CLIENT_COPY.titleMy}
            value={totalLeads}
            format="count"
            change={trends.leads}
            variant="inset"
          />
          <MetricCard
            label="Закрытые сделки"
            value={closedDeals}
            format="count"
            change={trends.closedDeals}
            variant="inset"
          />
          <MetricCard
            label="Начислено комиссии"
            value={commissionAccrued}
            format="currency"
            change={trends.commission}
            variant="inset"
          />
        </div>
      </div>
    </section>
  );
}
