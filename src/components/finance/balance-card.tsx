import { formatCurrency } from "@/lib/commission";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  label: string;
  amount: number;
  currency?: string;
  className?: string;
}

export function BalanceCard({ label, amount, currency = "USD", className }: BalanceCardProps) {
  return (
    <div className={cn("rounded-2xl bg-[#f6f6f6] px-5 py-4", className)}>
      <p className="text-2xl font-bold tracking-tight text-[#050505]">
        {formatCurrency(amount, currency)}
      </p>
      <p className="mt-1 text-sm text-[#6b7280]">{label}</p>
    </div>
  );
}
