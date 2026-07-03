import { cn } from "@/lib/utils";
import { TrendValue } from "@/components/ui/trend-value";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel = "за мес.",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "min-w-[140px] flex-1 rounded-2xl bg-[#f6f6f6] px-5 py-4",
        className
      )}
    >
      <p className="text-2xl font-bold tracking-tight text-[#050505] md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-[#6b7280]">{label}</p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <TrendValue change={change} className="text-xs" />
          <span className="text-xs text-[#6b7280]">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

export { TrendValue as TrendIndicatorInline };
