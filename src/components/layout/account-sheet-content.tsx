"use client";

import { useState } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { getUserRoleLabel } from "@/lib/statuses";
import { PARTNER_DOCUMENTS } from "@/lib/partner-documents";
import { LegalDocumentModal } from "@/components/legal/legal-document-modal";

function ProfileRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--color-mist-gray)] py-3.5 last:border-b-0">
      <dt className="shrink-0 text-[14px] text-[var(--color-zinc-gray)]">{label}</dt>
      <dd className="min-w-0 text-right text-[14px] font-medium text-[var(--color-carbon-black)]">
        {value}
      </dd>
    </div>
  );
}

export function AccountSheetContent() {
  const user = useCurrentUser();
  const { getPartnerProfile } = useApp();
  const profile = getPartnerProfile(user.id);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState("");

  const profileRows = [
    ["Имя", user.name],
    ["Email", user.email],
    ["Telegram", user.telegram],
    ["Телефон", profile.phone],
    ["Страна", profile.country],
    ["Город", profile.city],
    ["Роль", getUserRoleLabel(user.role)],
    ["Способ выплаты", profile.paymentMethod],
    ["Реквизиты", profile.paymentDetails],
    [
      "Дата регистрации",
      profile.onboardingCompletedAt
        ? new Date(profile.onboardingCompletedAt).toLocaleDateString("ru-RU")
        : "",
    ],
  ] as const;

  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-[19px] font-normal tracking-[-0.012em] text-[var(--color-carbon-black)]">
          Ваши данные
        </h3>
        <p className="mt-1 text-[14px] text-[var(--color-zinc-gray)]">
          Информация, которую вы указали при входе в панель
        </p>
        <dl className="mt-4 border-y border-[var(--color-mist-gray)]">
          {profileRows.map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </dl>
      </section>

      <section>
        <h3 className="text-[19px] font-normal tracking-[-0.012em] text-[var(--color-carbon-black)]">
          Документы
        </h3>
        <p className="mt-1 text-[14px] text-[var(--color-zinc-gray)]">
          Можно открыть и просмотреть в любой момент
        </p>
        <ul className="mt-4 divide-y divide-[var(--color-mist-gray)] border-y border-[var(--color-mist-gray)]">
          {PARTNER_DOCUMENTS.map((item) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => {
                  setOpenSlug(item.slug);
                  setOpenTitle(item.title);
                }}
                className="flex w-full items-center gap-3 py-3.5 text-left transition-opacity hover:opacity-80"
              >
                <FileText className="size-4 shrink-0 text-[var(--color-zinc-gray)]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-[var(--color-carbon-black)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[var(--color-zinc-gray)]">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-[var(--color-ash-gray)]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <LegalDocumentModal
        slug={openSlug}
        title={openTitle}
        open={!!openSlug}
        onClose={() => setOpenSlug(null)}
      />
    </div>
  );
}
