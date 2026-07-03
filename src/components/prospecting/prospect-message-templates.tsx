"use client";

import { CopyButton } from "@/components/academy/copy-button";
import { getTemplatesForProspect } from "@/lib/prospecting-utils";
import type { ProspectContact } from "@/lib/prospecting-types";

interface ProspectMessageTemplatesProps {
  prospect: ProspectContact;
  onCopyAndMark: (text: string) => void;
}

export function ProspectMessageTemplates({ prospect, onCopyAndMark }: ProspectMessageTemplatesProps) {
  const templates = getTemplatesForProspect(prospect);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#050505]">Что написать</h3>
      <p className="text-xs text-[#6b7280]">
        После сообщения обнови статус, чтобы не написать одному бизнесу два раза.
      </p>
      <div className="space-y-2">
        {templates.slice(0, 6).map((t) => (
          <div key={t.id} className="rounded-xl bg-[#f6f6f6] p-4">
            <p className="text-xs font-medium text-[#050505]">{t.title}</p>
            <p className="mt-1 text-sm text-[#6b7280] line-clamp-3">{t.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton text={t.text} label="Скопировать" className="text-xs" />
              <button
                type="button"
                onClick={() => onCopyAndMark(t.text)}
                className="inline-flex h-10 items-center rounded-full bg-[#050505] px-4 text-xs font-medium text-white"
              >
                Скопировать и «Написали»
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
