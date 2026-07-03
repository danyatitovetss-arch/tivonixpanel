import { getLegalDocumentBySlug } from "@/lib/legal-documents-content";

export interface PartnerDocumentListItem {
  slug: string;
  title: string;
  description: string;
}

export const PARTNER_DOCUMENTS: PartnerDocumentListItem[] = [
  {
    slug: "partner-agreement",
    title: "Договор партнёра",
    description: "Условия сотрудничества с TIVONIX",
  },
  {
    slug: "privacy",
    title: "Политика конфиденциальности",
    description: "Как мы храним и используем данные",
  },
  {
    slug: "commission-rules",
    title: "Правила комиссии",
    description: "Проценты, бонусы и примеры расчёта",
  },
];

export function getPartnerDocumentContent(slug: string) {
  return getLegalDocumentBySlug(slug);
}
