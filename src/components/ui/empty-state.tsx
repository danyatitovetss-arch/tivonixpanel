import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl bg-[#fafafa] px-6 py-16 text-center",
        className
      )}
    >
      <Inbox className="mb-4 size-10 text-[#6b7280]" strokeWidth={1.5} />
      <p className="text-base font-medium text-[#050505]">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[#6b7280]">{description}</p>
      )}
    </div>
  );
}
