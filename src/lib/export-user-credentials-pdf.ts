type PdfMakeInstance = {
  vfs: Record<string, string>;
  createPdf: (doc: Record<string, unknown>) => { download: (name: string) => void };
};

const BRAND = {
  black: "#18181b",
  grayBg: "#F6F6F6",
  grayLine: "#EBEBEB",
  grayText: "#6B7280",
  grayMuted: "#9CA3AF",
  white: "#FFFFFF",
} as const;

export type UserCredentialsPdfData = {
  fullName: string;
  email: string;
  password: string;
  roleLabel?: string;
  loginUrl: string;
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

function credentialRow(label: string, value: string, mono = false) {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: label, style: "credLabel" },
              { text: value, style: mono ? "credValueMono" : "credValue" },
            ],
            fillColor: BRAND.grayBg,
            border: [false, false, false, false],
            margin: [16, 14, 16, 14],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 10],
  };
}

function sanitizeFilename(email: string) {
  return email.replace(/@.+$/, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "partner";
}

export async function exportUserCredentialsPdf(data: UserCredentialsPdfData): Promise<void> {
  const [pdfMake, logo] = await Promise.all([loadPdfMake(), fetchLogoDataUrl()]);

  const generatedAt = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const contentWidth = 515;
  const steps = [
    "Откройте ссылку входа и авторизуйтесь с данными ниже.",
    "Заполните анкету партнёра и примите условия программы.",
    "Задайте свой постоянный пароль вместо временного.",
  ];

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 32, 40, 48],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: BRAND.black,
      lineHeight: 1.35,
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
          { width: 130, stack: [{ image: logo, width: 112 }] },
          {
            width: "*",
            alignment: "right",
            stack: [
              { text: "Доступ к панели", style: "title" },
              { text: "TIVONIX Partners CRM", style: "brand" },
              { text: generatedAt, style: "meta" },
            ],
          },
        ],
        margin: [0, 0, 0, 32],
      },
      {
        text: `Здравствуйте, ${data.fullName}!`,
        style: "greeting",
        margin: [0, 0, 0, 8],
      },
      {
        text: "Для вас создан аккаунт в партнёрской CRM TIVONIX. Ниже — данные для первого входа. Сохраните этот документ в надёжном месте и не передавайте пароль третьим лицам.",
        style: "intro",
        margin: [0, 0, 0, 24],
      },
      ...(data.roleLabel
        ? [
            {
              text: `Роль: ${data.roleLabel}`,
              style: "roleBadge",
              margin: [0, 0, 0, 16],
            },
          ]
        : []),
      credentialRow("Email (логин)", data.email),
      credentialRow("Временный пароль", data.password, true),
      credentialRow("Ссылка для входа", data.loginUrl),
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: contentWidth, y2: 0, lineWidth: 0.5, lineColor: BRAND.grayLine },
        ],
        margin: [0, 18, 0, 18],
      },
      { text: "Что сделать после входа", style: "sectionTitle", margin: [0, 0, 0, 12] },
      {
        ol: steps.map((step) => ({ text: step, style: "step" })),
        margin: [0, 0, 0, 28],
      },
      {
        table: {
          widths: [contentWidth],
          body: [
            [
              {
                stack: [
                  { text: "Важно", style: "noticeTitle" },
                  {
                    text: "Временный пароль действует до первой смены. После онбординга рекомендуем использовать только ваш личный пароль.",
                    style: "noticeText",
                  },
                ],
                fillColor: BRAND.black,
                border: [false, false, false, false],
                margin: [16, 14, 16, 14],
              },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 0],
      },
      {
        text: "Документ сформирован автоматически · TIVONIX Partners",
        style: "footer",
        margin: [0, 36, 0, 0],
      },
    ],
    styles: {
      title: { fontSize: 22, bold: true, color: BRAND.black, margin: [0, 0, 0, 4] },
      brand: { fontSize: 10, color: BRAND.grayText, margin: [0, 0, 0, 6] },
      meta: { fontSize: 8, color: BRAND.grayMuted },
      greeting: { fontSize: 16, bold: true, color: BRAND.black },
      intro: { fontSize: 10, color: BRAND.grayText, lineHeight: 1.45 },
      roleBadge: { fontSize: 9, color: BRAND.grayText, italics: true },
      credLabel: { fontSize: 8, color: BRAND.grayMuted, margin: [0, 0, 0, 6] },
      credValue: { fontSize: 12, bold: true, color: BRAND.black },
      credValueMono: { fontSize: 13, bold: true, color: BRAND.black, characterSpacing: 0.5 },
      sectionTitle: { fontSize: 11, bold: true, color: BRAND.black },
      step: { fontSize: 10, color: BRAND.black, margin: [0, 0, 0, 6] },
      noticeTitle: { fontSize: 9, bold: true, color: BRAND.white, margin: [0, 0, 0, 6] },
      noticeText: { fontSize: 9, color: BRAND.white, lineHeight: 1.4 },
      footer: { fontSize: 7, color: BRAND.grayMuted, alignment: "center" },
    },
  };

  pdfMake.createPdf(docDefinition).download(`tivonix-dostup-${sanitizeFilename(data.email)}.pdf`);
}
