import { DAILY_GOALS } from "@/lib/prospecting-data";
import { getTodayProspectingStats } from "@/lib/prospecting-utils";
import type { ProspectContact } from "@/lib/prospecting-types";

export function DailyProgress({ prospects }: { prospects: ProspectContact[] }) {
  const stats = getTodayProspectingStats(prospects);
  const items = [
    { label: "Найдено сегодня", current: stats.found, goal: DAILY_GOALS.found },
    { label: "Проверено", current: stats.checked, goal: DAILY_GOALS.checked },
    { label: "Написано", current: stats.messaged, goal: DAILY_GOALS.messaged },
    { label: "Ответили", current: stats.replied, goal: DAILY_GOALS.replied },
  ];

  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
      <h3 className="text-sm font-semibold text-[#18181b]">Сегодняшняя цель</h3>
      <p className="mt-1 text-xs text-[#71717a]">
        Найти 20 бизнесов · проверить 10 · написать 5 · обновить CRM
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const pct = Math.min(100, Math.round((item.current / item.goal) * 100));
          return (
            <div key={item.label}>
              <div className="flex justify-between text-xs">
                <span className="text-[#18181b]">{item.label}</span>
                <span className="text-[#71717a]">{item.current}/{item.goal}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[var(--color-sunrise-coral)]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
