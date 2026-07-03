import type { StatusGuideRow } from "@/lib/academy-data";

interface StatusGuideTableProps {
  rows: StatusGuideRow[];
}

export function StatusGuideTable({ rows }: StatusGuideTableProps) {
  return (
    <>
      {/* Mobile: карточки */}
      <div className="space-y-2 lg:hidden">
        {rows.map((row) => (
          <div key={row.status} className="rounded-2xl bg-[#f6f6f6] p-4">
            <p className="text-sm font-medium text-[#050505]">{row.status}</p>
            <p className="mt-1 text-sm text-[#6b7280]">{row.meaning}</p>
          </div>
        ))}
      </div>

      {/* Desktop: таблица */}
      <div className="hidden overflow-hidden rounded-2xl bg-[#f6f6f6] lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#ebebeb]">
              <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-[#6b7280]">Что значит</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.status} className="border-b border-[#ebebeb] last:border-b-0">
                <td className="px-4 py-3.5 font-medium text-[#050505]">{row.status}</td>
                <td className="px-4 py-3.5 text-[#6b7280]">{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
