"use client";

import { useState } from "react";
import { OkxPageTitle } from "@/components/ui/okx-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Download, Info } from "lucide-react";

const INFO_BLOCKS = [
  {
    title: "Зачем этот раздел",
    text: "Это рабочий список найденных бизнесов. Сюда ты складываешь контакты на этапе поиска — до того, как они станут лидами в CRM.",
  },
  {
    title: "Откуда добавлять",
    text: "2ГИС, Google Maps, Instagram, Telegram и сайты компаний. Главное — зафиксировать контакт, чтобы не потерять и не путаться.",
  },
  {
    title: "Как работать",
    items: [
      "Добавь контакт с источником и заметкой",
      "Напиши сообщение и обнови статус",
      "В лиды переводи только перспективных или тех, кто ответил",
    ],
  },
  {
    title: "Важно",
    text: "Не каждый контакт должен становиться лидом. Список нужен, чтобы спокойно проходить по базе без хаоса.",
  },
] as const;

interface ProspectingHeaderProps {
  onAdd: () => void;
  onExport: () => void;
}

export function ProspectingHeader({
  onAdd,
  onExport,
}: ProspectingHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <OkxPageTitle title="Поиск клиентов" className="min-w-0 flex-1 space-y-0" />
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6] text-[#6b7280] transition-colors hover:bg-[#efefef] hover:text-[#050505]"
          aria-label="Как работает раздел поиска клиентов"
        >
          <Info className="size-4" strokeWidth={2.25} />
        </button>
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 p-0 shadow-[0_8px_30px_rgba(5,5,5,0.12)] sm:max-w-md">
          <DialogHeader className="border-b border-[#ebebeb] px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-[#050505]">
              Как работает «Поиск клиентов»
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 py-5">
            {INFO_BLOCKS.map((block) => (
              <div key={block.title}>
                <h3 className="text-sm font-semibold text-[#050505]">{block.title}</h3>
                {"text" in block && (
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">{block.text}</p>
                )}
                {"items" in block && (
                  <ul className="mt-2 space-y-1.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-[#6b7280]">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-[#9ca3af]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-[#ebebeb] px-6 py-4">
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              className="h-10 w-full rounded-full bg-[#050505] text-sm font-medium text-white"
            >
              Понятно
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#050505] px-4 text-sm font-medium text-white"
        >
          <Plus className="size-4" />
          Добавить контакт
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#f6f6f6] px-4 text-sm font-medium text-[#050505]"
        >
          <Download className="size-4" />
          Скачать
        </button>
      </div>
    </div>
  );
}
