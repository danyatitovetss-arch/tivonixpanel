import { calculateCommission, formatCurrency } from "@/lib/commission";
import type { CommissionSettings } from "@/lib/types";

interface CommissionPreviewProps {
  amount: number;
  partnerClosedDealsCount: number;
  settings: CommissionSettings;
}

export function CommissionPreview({
  amount,
  partnerClosedDealsCount,
  settings,
}: CommissionPreviewProps) {
  if (!amount || amount <= 0) return null;

  const calc = calculateCommission(amount, partnerClosedDealsCount, settings);

  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-4 space-y-2 text-sm">
      <p className="font-medium text-[#18181b]">Расчёт комиссии</p>
      <div className="flex justify-between text-[#71717a]">
        <span>Базовый процент</span>
        <span>{calc.basePercent}%</span>
      </div>
      {calc.hasBonus && (
        <div className="flex justify-between text-[#71717a]">
          <span>Бонус ({settings.bonusAfterClosedDeals}+ сделок)</span>
          <span>+{calc.bonusPercent}%</span>
        </div>
      )}
      <div className="flex justify-between font-medium text-[#18181b]">
        <span>Итого</span>
        <span>
          {calc.percent}% = {formatCurrency(calc.amount)}
        </span>
      </div>
    </div>
  );
}
