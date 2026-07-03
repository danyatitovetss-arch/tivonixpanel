"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LeadDataRow {
  label: string;
  value: ReactNode;
  hidden?: boolean;
}

export function LeadDataTable({
  rows,
  className,
}: {
  rows: LeadDataRow[];
  className?: string;
}) {
  const visible = rows.filter((r) => !r.hidden && r.value !== null && r.value !== undefined && r.value !== "");

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-[#f6f6f6]", className)}>
      <table className="w-full text-sm">
        <tbody>
          {visible.map((row) => (
            <tr key={row.label} className="border-b border-[#ebebeb] last:border-b-0">
              <td className="w-[38%] px-4 py-3.5 align-top text-[#6b7280] sm:w-[180px]">
                {row.label}
              </td>
              <td className="px-4 py-3.5 align-top font-medium text-[#050505]">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
