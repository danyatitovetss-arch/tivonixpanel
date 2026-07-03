import { cn } from "@/lib/utils";

interface TrendValueProps {
  change: number;
  className?: string;
  showSign?: boolean;
}

/** OKX-style: зелёный +N%, красный −N%, без иконок */
export function TrendValue({ change, className, showSign = true }: TrendValueProps) {
  const isUp = change >= 0;

  return (
    <span
      className={cn(
        "text-sm font-medium tabular-nums",
        isUp ? "text-[#16a34a]" : "text-[#dc2626]",
        className
      )}
    >
      {showSign && isUp ? "+" : ""}
      {change}%
    </span>
  );
}
