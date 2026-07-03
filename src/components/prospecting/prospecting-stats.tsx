import { getProspectStatsCounts } from "@/lib/prospecting-utils";
import type { ProspectContact } from "@/lib/prospecting-types";

interface ProspectingStatsProps {
  prospects: ProspectContact[];
}

const STAT_ITEMS: { key: keyof ReturnType<typeof getProspectStatsCounts>; label: string }[] = [
  { key: "total", label: "Всего контактов" },
  { key: "unchecked", label: "Не проверены" },
  { key: "checked", label: "Проверены" },
  { key: "messaged", label: "Написали" },
  { key: "followUp", label: "Ждут повтора" },
  { key: "replied", label: "Ответили" },
  { key: "converted", label: "В лидах" },
  { key: "bad", label: "Дубли / не подходят" },
];

export function ProspectingStats({ prospects }: ProspectingStatsProps) {
  const counts = getProspectStatsCounts(prospects);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      {STAT_ITEMS.map((item) => (
        <div key={item.key} className="rounded-2xl bg-[#f6f6f6] px-4 py-3">
          <p className="text-2xl font-semibold text-[#050505]">{counts[item.key]}</p>
          <p className="mt-0.5 text-xs text-[#6b7280]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
