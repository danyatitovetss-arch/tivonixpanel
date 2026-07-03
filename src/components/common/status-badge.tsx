import { cn } from "@/lib/utils";
import { getStatusVariant } from "@/lib/statuses";

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const variantStyles = {
  default: "bg-[#050505] text-white",
  success: "bg-[#dcfce7] text-[#166534]",
  secondary: "bg-[#e5e5e5] text-[#050505]",
  outline: "bg-transparent text-[#6b7280] border border-[#e5e5e5]",
  muted: "bg-[#f6f6f6] text-[#6b7280]",
  warning: "bg-[#fef3c7] text-[#92400e]",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {label ?? "—"}
    </span>
  );
}
