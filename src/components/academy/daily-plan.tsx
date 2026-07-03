import type { DailyPlanItem, WeeklyPlanItem } from "@/lib/academy-data";

interface DailyPlanProps {
  items: DailyPlanItem[];
  weekly?: WeeklyPlanItem[];
  conclusion?: string;
}

export function DailyPlan({ items, weekly, conclusion }: DailyPlanProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#f6f6f6] p-5 md:p-6">
        <h3 className="text-base font-semibold text-[#050505]">План на 1 час</h3>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.time} className="flex flex-col gap-1 rounded-xl bg-white p-4 sm:flex-row sm:gap-4">
              <span className="shrink-0 text-sm font-semibold text-[#050505]">{item.time}</span>
              <span className="text-sm leading-relaxed text-[#6b7280]">{item.task}</span>
            </div>
          ))}
        </div>
        {conclusion && (
          <p className="mt-5 text-sm leading-relaxed text-[#6b7280]">{conclusion}</p>
        )}
      </div>

      {weekly && weekly.length > 0 && (
        <div className="rounded-2xl bg-[#f6f6f6] p-5 md:p-6">
          <h3 className="text-base font-semibold text-[#050505]">Недельная стратегия</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {weekly.map((day) => (
              <div key={day.day} className="rounded-xl bg-white p-4">
                <p className="text-sm font-semibold text-[#050505]">{day.day}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{day.focus}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
