const DELIMITER = ";";

export type ExportColumn<T extends Record<string, unknown>> = {
  key: keyof T;
  label: string;
};

/** Prevent CSV/Excel formula injection from user-controlled cells. */
export function sanitizeSpreadsheetCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Да" : "Нет";

  let text = String(value);
  // Neutralize formula prefixes used by Excel/LibreOffice
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return text;
}

function escapeCsvCell(value: string): string {
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
  return escapeCsvCell(sanitizeSpreadsheetCell(value));
}

export function buildPlainTextExport<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  const header = columns.map((c) => escapeCsvCell(sanitizeSpreadsheetCell(c.label))).join(DELIMITER);
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
  triggerDownload(blob, `${filename}.txt`);
}

export type ExcelExportOptions = {
  sheetName?: string;
};

/**
 * Spreadsheet export without the vulnerable `xlsx` package.
 * Produces a UTF-8 CSV that Excel / Google Sheets open natively.
 * Cell values are sanitized against formula injection.
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[],
  options?: ExcelExportOptions
): Promise<void> {
  void options;
  if (data.length === 0) {
    throw new Error("Нет данных для экспорта");
  }

  // Yield to keep UI responsive on large sets
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

  const text = buildPlainTextExport(data, columns);
  const blob = new Blob(["\uFEFF" + text], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, `${filename}.csv`);
}

function triggerDownload(blob: Blob, downloadName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = downloadName;
  link.click();
  URL.revokeObjectURL(url);
}

/** @deprecated use exportToPlainText */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[]
): void {
  exportToPlainText(data, filename, columns);
}
