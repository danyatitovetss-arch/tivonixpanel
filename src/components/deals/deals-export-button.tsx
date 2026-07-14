"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportDealsToPdf, type DealPdfRow } from "@/lib/export-deals-pdf";
import { toUserMessage } from "@/lib/errors";

interface DealsExportButtonProps {
  rows: DealPdfRow[];
  totalAmount: string;
  totalCommission: string;
  filename?: string;
  className?: string;
}

export function DealsExportButton({
  rows,
  totalAmount,
  totalCommission,
  filename = "sdelki",
  className,
}: DealsExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (rows.length === 0) return;
    setLoading(true);
    try {
      await exportDealsToPdf(
        rows,
        {
          count: rows.length,
          totalAmount,
          totalCommission,
        },
        filename
      );
      toast.success("PDF скачан");
    } catch (error) {
      toast.error(toUserMessage(error, "Не удалось сформировать PDF"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading || rows.length === 0}
      onClick={() => void handleDownload()}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full bg-[#f4f4f5] px-5 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#ebebeb] disabled:opacity-50",
        className
      )}
    >
      <Download className="size-4" />
      {loading ? "Формирование…" : "Скачать PDF"}
    </button>
  );
}
