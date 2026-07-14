import { cn } from "@/lib/utils";
import { getStatusVariant } from "@/lib/statuses";

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const variantStyles = {
  default: "bg-[var(--color-carbon-black)] text-white",
  success: "bg-[#ecfdf3] text-[#166534]",
  secondary: "bg-[var(--color-mist-gray)] text-[var(--color-carbon-black)]",
  outline: "bg-transparent text-[var(--color-zinc-gray)] border border-[var(--color-mist-gray)]",
  muted: "bg-[var(--color-fog-gray)] text-[var(--color-zinc-gray)]",
  warning: "bg-[#fff7ed] text-[#c2410c]",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[9999px] px-2.5 py-1 text-[11px] font-bold tracking-[-0.005em] whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {label ?? "—"}
    </span>
  );
}
