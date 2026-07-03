"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const SLUG_LABELS: Record<string, string> = {
  privacy: "Политика конфиденциальности",
  terms: "Условия использования",
  "personal-data-consent": "Согласие на обработку персональных данных",
  "partner-agreement": "Партнёрское соглашение",
  "commission-rules": "Правила комиссий",
  cookies: "Cookies",
};

export default function LegalDocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<{
    title: string;
    version: string;
    published_at: string;
    content: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`/api/legal/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        setDoc(json.data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const title = doc?.title ?? SLUG_LABELS[slug] ?? "Документ";

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-[#6b7280] underline"
      >
        ← Назад
      </button>

      <h1 className="mt-6 text-2xl font-semibold text-[#050505]">{title}</h1>

      {doc ? (
        <>
          <p className="mt-2 text-sm text-[#6b7280]">
            Версия {doc.version} · {doc.status} ·{" "}
            {doc.published_at ? new Date(doc.published_at).toLocaleDateString("ru-RU") : "—"}
          </p>
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Черновик документа. Перед публичным использованием текст должен быть проверен юристом.
          </p>
          <article className="prose prose-sm mt-8 max-w-none whitespace-pre-wrap text-[#050505]">
            {doc.content}
          </article>
        </>
      ) : loading ? (
        <p className="mt-8 text-sm text-[#6b7280]">Загрузка…</p>
      ) : (
        <p className="mt-8 text-sm text-[#6b7280]">
          Активная версия документа пока не опубликована.{" "}
          <Link href="/onboarding/legal" className="underline">
            Вернуться к onboarding
          </Link>
        </p>
      )}
    </div>
  );
}
