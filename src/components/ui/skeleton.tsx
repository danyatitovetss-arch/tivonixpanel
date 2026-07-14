import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#f4f4f5]", className)}
      aria-hidden
      {...props}
    />
  );
}
