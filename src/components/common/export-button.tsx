"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportToExcel, type ExportColumn, type ExcelExportOptions } from "@/lib/export";
import { cn } from "@/lib/utils";

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  columns: ExportColumn<T>[];
  label?: string;
  className?: string;
  disabled?: boolean;
  sheetName?: ExcelExportOptions["sheetName"];
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  columns,
  label = "Скачать Excel",
  className,
  disabled,
  sheetName,
}: ExportButtonProps<T>) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (data.length === 0 || loading) return;
    setLoading(true);
    try {
      await exportToExcel(data, filename, columns, { sheetName });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading || data.length === 0}
      onClick={() => void handleExport()}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full bg-[#f6f6f6] px-5 text-sm font-medium text-[#050505] transition-colors hover:bg-[#ebebeb] disabled:opacity-50",
        className
      )}
    >
      <Download className="size-4" />
      {loading ? "Формирование…" : label}
    </button>
  );
}
