import { cn } from "@/lib/utils";

interface StepCardProps {
  title: string;
  text: string;
  className?: string;
}

export function StepCard({ title, text, className }: StepCardProps) {
  return (
    <div className={cn("rounded-2xl bg-[#f6f6f6] p-5 md:p-6", className)}>
      <h3 className="text-base font-semibold text-[#050505]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{text}</p>
    </div>
  );
}
