import type { CommissionSettings } from "./types";

export interface CommissionResult {
  percent: number;
  amount: number;
  hasBonus: boolean;
  basePercent: number;
  bonusPercent: number;
}

export const DEFAULT_COMMISSION_SETTINGS: Omit<CommissionSettings, "id" | "updatedAt"> = {
  basePercentUnder2000: 10,
  basePercentFrom2000: 15,
  bonusAfterClosedDeals: 3,
  bonusPercent: 10,
  currency: "USD",
};

export function calculateCommission(
  amount: number,
  partnerClosedDealsCount: number,
  settings: Pick<
    CommissionSettings,
    | "basePercentUnder2000"
    | "basePercentFrom2000"
    | "bonusAfterClosedDeals"
    | "bonusPercent"
  > = DEFAULT_COMMISSION_SETTINGS
): CommissionResult {
  const basePercent =
    amount < 2000 ? settings.basePercentUnder2000 : settings.basePercentFrom2000;
  const hasBonus = partnerClosedDealsCount >= settings.bonusAfterClosedDeals;
  const bonusPercent = hasBonus ? settings.bonusPercent : 0;
  const percent = basePercent + bonusPercent;
  const commissionAmount = Math.round((amount * percent) / 100);

  return {
    percent,
    amount: commissionAmount,
    hasBonus,
    basePercent,
    bonusPercent,
  };
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
