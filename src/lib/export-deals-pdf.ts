type PdfMakeInstance = {
  vfs: Record<string, string>;
  createPdf: (doc: Record<string, unknown>) => { download: (name: string) => void };
};

/** Цвета панели TIVONIX */
const BRAND = {
  black: "#050505",
  grayBg: "#F6F6F6",
  grayLine: "#EBEBEB",
  grayText: "#6B7280",
  grayMuted: "#9CA3AF",
  white: "#FFFFFF",
} as const;

export type DealPdfRow = {
  client: string;
  service: string;
  amount: string;
  partner: string;
  commission: string;
  commissionPercent: string;
  payment: string;
  date: string;
};

export type DealsPdfSummary = {
  count: number;
  totalAmount: string;
  totalCommission: string;
};

async function loadPdfMake(): Promise<PdfMakeInstance> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  const pdfMake = pdfMakeModule.default as PdfMakeInstance;
  const pdfFonts = pdfFontsModule as {
    pdfMake?: { vfs: Record<string, string> };
    default?: { pdfMake?: { vfs: Record<string, string> }; vfs?: Record<string, string> };
  };

  pdfMake.vfs =
    pdfFonts.pdfMake?.vfs ??
    pdfFonts.default?.pdfMake?.vfs ??
    pdfFonts.default?.vfs ??
    pdfMake.vfs;

  return pdfMake;
}

async function fetchLogoDataUrl(): Promise<string> {
  const response = await fetch("/images/tl-Photoroom.png");
  if (!response.ok) throw new Error("Не удалось загрузить логотип");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать логотип"));
    reader.readAsDataURL(blob);
  });
}

function formatCommissionCell(commission: string, commissionPercent: string): string {
  const percent = commissionPercent.replace(/%/g, "").trim();
  return percent ? `${commission} · ${percent}%` : commission;
}

function receiptTableLayout() {
  return {
    hLineWidth: (i: number, node: { table: { body: unknown[] } }) => {
      if (i === 0 || i === node.table.body.length) return 0;
      if (i === 1) return 1;
      return 0.5;
    },
    vLineWidth: () => 0,
    hLineColor: (i: number) => (i === 1 ? BRAND.grayLine : BRAND.grayLine),
    fillColor: (rowIndex: number) => (rowIndex === 0 ? BRAND.grayBg : null),
    paddingLeft: () => 10,
    paddingRight: () => 10,
    paddingTop: () => 8,
    paddingBottom: () => 8,
  };
}

export async function exportDealsToPdf(
  rows: DealPdfRow[],
  summary: DealsPdfSummary,
  filename: string
): Promise<void> {
  if (rows.length === 0) return;

  const [pdfMake, logo] = await Promise.all([loadPdfMake(), fetchLogoDataUrl()]);

  const generatedAt = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tableBody: unknown[][] = [
    [
      { text: "Клиент", style: "th" },
      { text: "Услуга", style: "th" },
      { text: "Сумма", style: "th", alignment: "right" },
      { text: "Партнёр", style: "th" },
      { text: "Комиссия", style: "th", alignment: "right" },
      { text: "Оплата", style: "th" },
      { text: "Дата", style: "th", alignment: "right" },
    ],
    ...rows.map((row) => [
      { text: row.client, style: "tdBold" },
      { text: row.service, style: "td" },
      { text: row.amount, style: "td", alignment: "right" },
      { text: row.partner, style: "td" },
      {
        text: formatCommissionCell(row.commission, row.commissionPercent),
        style: "td",
        alignment: "right",
      },
      { text: row.payment, style: "td" },
      { text: row.date, style: "tdMuted", alignment: "right" },
    ]),
  ];

  const contentWidth = 515;

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 32, 40, 48],
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: BRAND.black,
      lineHeight: 1.25,
    },
    background: () => ({
      canvas: [{ type: "rect", x: 0, y: 0, w: 595.28, h: 841.89, color: BRAND.white }],
    }),
    content: [
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: contentWidth, h: 5, color: BRAND.black }],
        margin: [0, 0, 0, 28],
      },
      {
        columns: [
          {
            width: 130,
            stack: [{ image: logo, width: 112 }],
          },
          {
            width: "*",
            alignment: "right",
            stack: [
              { text: "Чек по сделкам", style: "title" },
              { text: "TIVONIX Partners", style: "brand" },
              { text: `Сформирован ${generatedAt}`, style: "meta" },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: [contentWidth],
          body: [
            [
              {
                columns: [
                  {
                    width: "*",
                    text: `Сделок в отчёте: ${summary.count}`,
                    style: "summaryPill",
                  },
                  {
                    width: "auto",
                    text: summary.totalAmount,
                    style: "summaryAmount",
                    alignment: "right",
                  },
                ],
                fillColor: BRAND.grayBg,
                border: [false, false, false, false],
                margin: [14, 10, 14, 10],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 14],
      },
      {
        table: {
          headerRows: 1,
          widths: [72, 54, 48, "*", 58, 52, 44],
          body: tableBody,
        },
        layout: receiptTableLayout(),
      },
      {
        table: {
          widths: [contentWidth],
          body: [
            [
              {
                stack: [
                  {
                    columns: [
                      { text: "Итого сумма сделок", style: "totalLabel", width: "*" },
                      { text: summary.totalAmount, style: "totalValue", width: "auto", alignment: "right" },
                    ],
                    margin: [0, 0, 0, 8],
                  },
                  {
                    canvas: [
                      { type: "line", x1: 0, y1: 0, x2: contentWidth - 28, y2: 0, lineWidth: 0.5, lineColor: BRAND.grayLine },
                    ],
                    margin: [0, 0, 0, 8],
                  },
                  {
                    columns: [
                      { text: "Итого комиссий", style: "totalLabel", width: "*" },
                      {
                        text: summary.totalCommission,
                        style: "totalValueAccent",
                        width: "auto",
                        alignment: "right",
                      },
                    ],
                  },
                ],
                fillColor: BRAND.grayBg,
                border: [false, false, false, false],
                margin: [14, 14, 14, 14],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 16, 0, 0],
      },
      {
        text: "Документ сформирован автоматически в панели TIVONIX Partners",
        style: "footer",
        margin: [0, 32, 0, 0],
      },
    ],
    styles: {
      title: { fontSize: 20, bold: true, color: BRAND.black, margin: [0, 0, 0, 2] },
      brand: { fontSize: 10, color: BRAND.grayText, margin: [0, 0, 0, 6] },
      meta: { fontSize: 8, color: BRAND.grayMuted },
      summaryPill: { fontSize: 9, color: BRAND.grayText },
      summaryAmount: { fontSize: 11, bold: true, color: BRAND.black },
      th: { fontSize: 8, bold: true, color: BRAND.black },
      td: { fontSize: 9, color: BRAND.black },
      tdBold: { fontSize: 9, bold: true, color: BRAND.black },
      tdMuted: { fontSize: 8, color: BRAND.grayText },
      totalLabel: { fontSize: 10, color: BRAND.grayText },
      totalValue: { fontSize: 12, bold: true, color: BRAND.black },
      totalValueAccent: { fontSize: 12, bold: true, color: BRAND.black },
      footer: { fontSize: 7, color: BRAND.grayMuted, alignment: "center" },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
}
