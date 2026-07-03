const DELIMITER = ";";

export type ExportColumn<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
};

function escapeCell(value: string): string {
  if (
    value.includes(DELIMITER) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  return escapeCell(String(value));
}

export function buildPlainTextExport<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  const header = columns.map((c) => escapeCell(c.label)).join(DELIMITER);
  const rows = data.map((row) =>
    columns.map((c) => formatCellValue(row[c.key])).join(DELIMITER)
  );
  return [header, ...rows].join("\r\n");
}

export function exportToPlainText<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[]
): void {
  if (data.length === 0) return;

  const text = buildPlainTextExport(data, columns);
  const blob = new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function columnWidth<T extends Record<string, unknown>>(
  columns: ExportColumn<T>[],
  data: T[],
  colIndex: number
): number {
  const col = columns[colIndex];
  const lengths = [
    col.label.length,
    ...data.map((row) => String(row[col.key] ?? "").length),
  ];
  return Math.min(Math.max(Math.max(...lengths) + 2, 10), 45);
}

export type ExcelExportOptions = {
  sheetName?: string;
};

export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[],
  options?: ExcelExportOptions
): Promise<void> {
  if (data.length === 0) return;

  const XLSX = await import("xlsx");
  const header = columns.map((c) => c.label);
  const body = data.map((row) =>
    columns.map((c) => {
      const value = row[c.key];
      if (value === null || value === undefined) return "";
      return value;
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  worksheet["!cols"] = columns.map((_, index) => ({
    wch: columnWidth(columns, data, index),
  }));

  if (data.length > 0) {
    const endCol = XLSX.utils.encode_col(columns.length - 1);
    worksheet["!autofilter"] = { ref: `A1:${endCol}${data.length + 1}` };
  }

  const workbook = XLSX.utils.book_new();
  const sheetName = (options?.sheetName ?? "Данные").slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: "xlsx" });
}

/** @deprecated use exportToPlainText */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[]
): void {
  exportToPlainText(data, filename, columns);
}
