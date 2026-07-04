import { cn } from "@/lib/utils";

interface TrendValueProps {
  change: number;
  className?: string;
  showSign?: boolean;
}

function TrendTriangle({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 10 8"
      aria-hidden
      className={cn("size-2.5 shrink-0 fill-current md:size-3", !up && "rotate-180")}
    >
      <path d="M5 0L10 8H0L5 0Z" />
    </svg>
  );
}

export function TrendValue({ change, className, showSign = true }: TrendValueProps) {
  const isUp = change >= 0;
  const isFlat = change === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        isFlat ? "text-[#6b7280]" : isUp ? "text-[#16a34a]" : "text-[#dc2626]",
        className
      )}
    >
      {!isFlat && <TrendTriangle up={isUp} />}
      {showSign && isUp && !isFlat ? "+" : ""}
      {change}%
    </span>
  );
}
