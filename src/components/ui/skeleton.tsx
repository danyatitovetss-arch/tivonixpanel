import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#f6f6f6]", className)}
      aria-hidden
      {...props}
    />
  );
}
