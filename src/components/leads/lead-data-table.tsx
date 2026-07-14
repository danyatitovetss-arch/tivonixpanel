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
  const visible = rows.filter(
    (r) => !r.hidden && r.value !== null && r.value !== undefined && r.value !== ""
  );

  return (
    <div className={cn("border-y border-[var(--color-mist-gray)]", className)}>
      <table className="w-full text-[15px]">
        <tbody>
          {visible.map((row) => (
            <tr
              key={row.label}
              className="border-b border-[var(--color-mist-gray)] last:border-b-0"
            >
              <td className="w-[38%] py-3.5 pr-4 align-top tracking-[-0.005em] text-[var(--color-zinc-gray)] sm:w-[160px]">
                {row.label}
              </td>
              <td className="py-3.5 align-top font-medium tracking-[-0.005em] text-[var(--color-carbon-black)]">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
