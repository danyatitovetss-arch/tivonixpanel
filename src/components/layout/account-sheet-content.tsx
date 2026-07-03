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
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-sm text-[#9ca3af] sm:w-36">{label}</dt>
      <dd className="text-sm text-[#050505]">{value}</dd>
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
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-[#050505]">Ваши данные</h3>
        <p className="mt-1 text-sm text-[#6b7280]">
          Информация, которую вы указали при входе в панель
        </p>
        <dl className="mt-4 space-y-3 rounded-2xl bg-[#f6f6f6] p-4">
          {profileRows.map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#050505]">Документы</h3>
        <p className="mt-1 text-sm text-[#6b7280]">Можно открыть и просмотреть в любой момент</p>
        <ul className="mt-4 space-y-2">
          {PARTNER_DOCUMENTS.map((item) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => {
                  setOpenSlug(item.slug);
                  setOpenTitle(item.title);
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-[#f6f6f6] px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <FileText className="size-4 text-[#6b7280]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#050505]">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-[#6b7280]">{item.description}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-[#9ca3af]" />
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
