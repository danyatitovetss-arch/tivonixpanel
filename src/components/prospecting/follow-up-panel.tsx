"use client";

import { FOLLOW_UP_TEMPLATE } from "@/lib/prospecting-data";
import { CopyButton } from "@/components/academy/copy-button";

interface FollowUpPanelProps {
  followUpAt: string | null;
  followUpSent: boolean;
  onSchedule: (date: string) => void;
}

export function FollowUpPanel({ followUpAt, followUpSent, onSchedule }: FollowUpPanelProps) {
  const defaultDate = followUpAt ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-5">
      <h3 className="text-sm font-semibold text-[#18181b]">Повторное сообщение</h3>
      <p className="mt-1 text-xs text-[#71717a]">
        Не спамь. Если после повторного сообщения ответа нет — поставь «Не подходит».
      </p>
      {followUpAt && (
        <p className="mt-2 text-sm text-[#18181b]">Запланировано: {followUpAt}</p>
      )}
      {followUpSent && (
        <p className="mt-1 text-xs text-[#9ca3af]">Повтор уже отправлялся</p>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input
          type="date"
          defaultValue={defaultDate}
          id="follow-up-date"
          className="h-10 rounded-xl bg-white px-3 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("follow-up-date") as HTMLInputElement;
            onSchedule(el?.value ?? defaultDate);
          }}
          className="h-10 rounded-full bg-[var(--color-sunrise-coral)] px-4 text-sm font-medium text-white"
        >
          Запланировать повтор
        </button>
      </div>
      <div className="mt-4 rounded-xl bg-white p-4">
        <p className="text-sm text-[#71717a]">{FOLLOW_UP_TEMPLATE}</p>
        <div className="mt-2"><CopyButton text={FOLLOW_UP_TEMPLATE} label="Скопировать" /></div>
      </div>
    </div>
  );
}
