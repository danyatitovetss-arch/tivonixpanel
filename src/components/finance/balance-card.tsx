import { formatCurrency } from "@/lib/commission";
import { cn } from "@/lib/utils";
import { TrendValue } from "@/components/ui/trend-value";

export type MetricFormat = "currency" | "count";

interface MetricCardProps {
  label: string;
  value: number;
  format?: MetricFormat;
  currency?: string;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "inset";
  className?: string;
}

function formatMetricValue(value: number, format: MetricFormat, currency: string) {
  if (format === "count") {
    return value.toLocaleString("ru-RU");
  }
  return formatCurrency(value, currency);
}

export function MetricCard({
  label,
  value,
  format = "currency",
  currency = "USD",
  change,
  changeLabel = "за мес.",
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-4 md:px-5 md:py-5",
        variant === "inset" ? "bg-white" : "bg-[#f6f6f6]",
        className
      )}
    >
      <p className="text-2xl font-bold tracking-tight text-[#050505] md:text-3xl">
        {formatMetricValue(value, format, currency)}
      </p>
      <p className="mt-1 text-sm leading-snug text-[#6b7280] md:text-base">{label}</p>
      {change !== undefined && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <TrendValue change={change} className="text-xs md:text-sm" />
          <span className="text-xs text-[#6b7280] md:text-sm">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use MetricCard with format="currency" */
export function BalanceCard({
  label,
  amount,
  currency = "USD",
  className,
  format = "currency",
  change,
  changeLabel,
  variant = "default",
}: {
  label: string;
  amount: number;
  currency?: string;
  className?: string;
  format?: MetricFormat;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "inset";
}) {
  return (
    <MetricCard
      label={label}
      value={amount}
      format={format}
      currency={currency}
      change={change}
      changeLabel={changeLabel}
      variant={variant}
      className={className}
    />
  );
}
