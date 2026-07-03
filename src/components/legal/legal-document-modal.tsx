"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ONBOARDING_CONSENT_DOCS = [
  { name: "acceptTerms", label: "Пользовательское соглашение", slug: "terms" },
  { name: "acceptPrivacy", label: "Политика конфиденциальности", slug: "privacy" },
  { name: "acceptPersonalData", label: "Согласие на обработку ПДн", slug: "personal-data-consent" },
  { name: "acceptPartnerAgreement", label: "Договор партнёра", slug: "partner-agreement" },
  { name: "acceptCommissionRules", label: "Правила комиссии", slug: "commission-rules" },
  { name: "acceptCookies", label: "Политика cookies", slug: "cookies" },
] as const;

type LegalDoc = {
  title: string;
  version: string;
  published_at: string | null;
  content: string;
};

export function LegalDocumentModal({
  slug,
  title,
  open,
  onClose,
}: {
  slug: string | null;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !slug) return;
    setLoading(true);
    setDoc(null);
    void fetch(`/api/legal/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        setDoc(json.data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, slug]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,720px)] max-w-[min(100%-2rem,42rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-[#e5e5e5] p-0"
      >
        <DialogHeader className="shrink-0 border-b border-[#e5e5e5] px-6 py-5 text-left">
          <DialogTitle className="text-lg font-semibold text-[#050505]">
            {doc?.title ?? title}
          </DialogTitle>
          {doc && (
            <DialogDescription className="text-sm text-[#6b7280]">
              Версия {doc.version}
              {doc.published_at
                ? ` · ${new Date(doc.published_at).toLocaleDateString("ru-RU")}`
                : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-sm text-[#6b7280]">Загрузка документа…</p>
          ) : doc?.content ? (
            <article className="whitespace-pre-wrap text-sm leading-relaxed text-[#050505]">
              {doc.content}
            </article>
          ) : (
            <p className="text-sm text-[#6b7280]">
              Текст документа пока недоступен. Обратитесь к администратору или попробуйте позже.
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-[#e5e5e5] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-[#050505] text-sm font-medium text-white hover:bg-[#050505]/90"
          >
            Закрыть
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
