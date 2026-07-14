import { cn } from "@/lib/utils";

export const academyCardClass = "rounded-2xl bg-[#f4f4f5]";

export function AcademyCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn(academyCardClass, className)} {...props}>
      {children}
    </div>
  );
}

export function AcademyCardBody({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AcademyCard className={cn("p-5 md:p-6", className)} {...props}>
      {children}
    </AcademyCard>
  );
}
