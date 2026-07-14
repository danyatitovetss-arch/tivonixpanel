"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProspectStatusBadge } from "@/components/prospecting/prospect-status-badge";
import { ProspectNotes } from "@/components/prospecting/prospect-notes";
import { ProspectActions } from "@/components/prospecting/prospect-actions";
import { ProspectMessageTemplates } from "@/components/prospecting/prospect-message-templates";
import { FollowUpPanel } from "@/components/prospecting/follow-up-panel";
import { DuplicateCheckPanel } from "@/components/prospecting/duplicate-check-panel";
import { ConvertToLeadDialog } from "@/components/prospecting/convert-to-lead-dialog";
import { useLeadDetail } from "@/components/leads/lead-detail-context";
import { PROSPECT_PRIORITY_LABELS, WEBSITE_QUALITY_LABELS } from "@/lib/prospecting-data";
import { useApp, useCurrentUser } from "@/lib/store";
import { addFollowUpDays } from "@/lib/prospecting-utils";

interface ProspectDetailContentProps {
  prospectId: string;
  onClose?: () => void;
}

export function ProspectDetailContent({ prospectId, onClose }: ProspectDetailContentProps) {
  const user = useCurrentUser();
  const { data, updateProspectContact, checkProspectDuplicate, convertProspectToLead } = useApp();
  const { openLead } = useLeadDetail();
  const [convertOpen, setConvertOpen] = useState(false);

  const prospect = useMemo(
    () => (data.prospectContacts ?? []).find((p) => p.id === prospectId),
    [data.prospectContacts, prospectId]
  );

  const activities = useMemo(
    () => (data.prospectActivities ?? []).filter((a) => a.prospectId === prospectId),
    [data.prospectActivities, prospectId]
  );

  const duplicateMatch = useMemo(() => {
    if (!prospect) return null;
    return checkProspectDuplicate(
      {
        businessName: prospect.businessName,
        website: prospect.website,
        instagram: prospect.instagram,
        telegram: prospect.telegram,
        phone: prospect.phone,
        email: prospect.email,
      },
      prospect.id
    );
  }, [prospect, checkProspectDuplicate]);

  if (!prospect) {
    return <p className="text-sm text-[#71717a]">Контакт не найден</p>;
  }

  function saveNotes(notes: string) {
    updateProspectContact(prospect!.id, { notes }, user.id, "Заметка обновлена");
  }

  function handleCopyAndMark(text: string) {
    navigator.clipboard.writeText(text);
    updateProspectContact(
      prospect!.id,
      {
        status: "messaged",
        firstMessageSentAt: new Date().toISOString().slice(0, 10),
        followUpAt: addFollowUpDays(2),
        messageTemplateUsed: text.slice(0, 40),
      },
      user.id,
      "Скопировано и отмечено: написали"
    );
    toast.success("Шаблон скопирован · статус: Написали");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ProspectStatusBadge status={prospect.status} />
        <span className="rounded-lg bg-[#f4f4f5] px-2.5 py-1 text-xs">
          {PROSPECT_PRIORITY_LABELS[prospect.priority]}
        </span>
      </div>

      <ProspectActions
        onMarkMessaged={() => {
          updateProspectContact(
            prospect.id,
            {
              status: "messaged",
              firstMessageSentAt: new Date().toISOString().slice(0, 10),
              followUpAt: addFollowUpDays(2),
            },
            user.id,
            "Отмечено: написали"
          );
          toast.success("Статус: Написали");
        }}
        onMarkReplied={() => updateProspectContact(prospect.id, { status: "replied" }, user.id, "Клиент ответил")}
        onConvert={() => setConvertOpen(true)}
        onNotRelevant={() => updateProspectContact(prospect.id, { status: "not_relevant" }, user.id, "Не подходит")}
        onDoNotContact={() => updateProspectContact(prospect.id, { status: "do_not_contact" }, user.id, "Не трогать")}
      />

      {duplicateMatch && <DuplicateCheckPanel match={duplicateMatch} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl bg-[#f4f4f5] p-4">
          <h3 className="text-sm font-semibold text-[#18181b]">Контакты</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Сайт", prospect.website],
              ["Instagram", prospect.instagram],
              ["Telegram", prospect.telegram],
              ["Телефон", prospect.phone],
              ["Email", prospect.email],
              ["Контакт", prospect.contactPerson],
            ].map(([k, v]) =>
              v ? (
                <div key={k} className="flex gap-2">
                  <dt className="text-[#9ca3af]">{k}:</dt>
                  <dd className="min-w-0 break-all">{v}</dd>
                </div>
              ) : null
            )}
          </dl>
        </section>

        <section className="rounded-2xl bg-[#f4f4f5] p-4">
          <h3 className="text-sm font-semibold text-[#18181b]">Проверка бизнеса</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-[#9ca3af]">Сайт:</dt>
              <dd>{prospect.hasWebsite === null ? "Не проверено" : prospect.hasWebsite ? "Есть" : "Нет"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[#9ca3af]">Качество:</dt>
              <dd>{WEBSITE_QUALITY_LABELS[prospect.websiteQuality]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[#9ca3af]">Онлайн-запись:</dt>
              <dd>{prospect.hasOnlineBooking ? "Да" : "Нет"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[#9ca3af]">Бот:</dt>
              <dd>{prospect.hasTelegramBot ? "Да" : "Нет"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[#9ca3af]">CRM:</dt>
              <dd>{prospect.hasCRM ? "Да" : "Нет"}</dd>
            </div>
            {prospect.painPoints && (
              <div className="flex gap-2">
                <dt className="text-[#9ca3af]">Проблемы:</dt>
                <dd>{prospect.painPoints}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-[#18181b]">Заметки</h3>
        <ProspectNotes notes={prospect.notes} onChange={saveNotes} />
      </section>

      <ProspectMessageTemplates prospect={prospect} onCopyAndMark={handleCopyAndMark} />

      <FollowUpPanel
        followUpAt={prospect.followUpAt}
        followUpSent={prospect.followUpSent}
        onSchedule={(date) => {
          updateProspectContact(prospect.id, { followUpAt: date, status: "follow_up_needed" }, user.id, "Запланирован повтор");
          toast.success("Повтор запланирован");
        }}
      />

      {activities.length > 0 && (
        <section className="rounded-2xl bg-[#f4f4f5] p-4">
          <h3 className="text-sm font-semibold text-[#18181b]">История</h3>
          <ul className="mt-3 space-y-2">
            {activities.map((a) => (
              <li key={a.id} className="text-sm text-[#71717a]">
                {new Date(a.createdAt).toLocaleString("ru-RU")} — {a.comment}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConvertToLeadDialog
        open={convertOpen}
        prospect={prospect}
        onClose={() => setConvertOpen(false)}
        onConfirm={() => {
          const lead = convertProspectToLead(prospect.id, user.id);
          if (lead) {
            toast.success("Контакт добавлен в лиды");
            setConvertOpen(false);
            onClose?.();
            openLead(lead.id);
          } else {
            toast.error("Не удалось — возможно дубль");
            setConvertOpen(false);
          }
        }}
      />
    </div>
  );
}
