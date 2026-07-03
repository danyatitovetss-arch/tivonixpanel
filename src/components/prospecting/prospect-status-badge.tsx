import { cn } from "@/lib/utils";
import { PROSPECT_STATUS_LABELS } from "@/lib/prospecting-data";
import type { ProspectStatus } from "@/lib/prospecting-types";

export function ProspectStatusBadge({
  status,
  className,
}: {
  status: ProspectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg bg-[#f6f6f6] px-2.5 py-1 text-xs font-medium text-[#050505]",
        className
      )}
    >
      {PROSPECT_STATUS_LABELS[status] ?? "—"}
    </span>
  );
}
