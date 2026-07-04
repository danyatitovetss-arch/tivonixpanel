"use client";

import { useState } from "react";
import { Check, Copy, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PlatformQueriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformName: string;
  queries: string[];
  hint?: string;
}

async function copyText(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error("Не удалось скопировать");
  }
}

export function PlatformQueriesModal({
  open,
  onOpenChange,
  platformName,
  queries,
  hint,
}: PlatformQueriesModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  function toggleQuery(query: string) {
    setSelected((prev) =>
      prev.includes(query) ? prev.filter((q) => q !== query) : [...prev, query]
    );
  }

  async function handleCopyOne(query: string) {
    await copyText(query, "Запрос скопирован");
    setLastCopied(query);
    setTimeout(() => setLastCopied(null), 1500);
  }

  async function handleCopySelected() {
    if (selected.length === 0) {
      toast.error("Выбери хотя бы один запрос");
      return;
    }
    await copyText(selected.join("\n"), `Скопировано запросов: ${selected.length}`);
  }

  async function handleCopyAll() {
    await copyText(queries.join("\n"), "Все запросы скопированы");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelected([]);
          setLastCopied(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(90dvh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-5 py-4 text-left">
          <DialogTitle className="text-lg font-semibold text-[#050505]">
            Запросы для {platformName}
          </DialogTitle>
          <DialogDescription className="text-base text-[#6b7280]">
            {hint ?? "Выбери запрос и нажми «Скопировать», или отметь несколько и скопируй разом."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-2">
            {queries.map((query) => {
              const isSelected = selected.includes(query);
              const isCopied = lastCopied === query;

              return (
                <li key={query}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl p-1 transition-colors",
                      isSelected ? "bg-[#050505]/10" : "bg-[#f6f6f6]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleQuery(query)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md bg-white",
                          isSelected && "bg-[#050505]"
                        )}
                      >
                        {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="text-base leading-snug text-[#050505]">{query}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyOne(query)}
                      title="Скопировать запрос"
                      className="mr-1 flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/80 hover:bg-white"
                    >
                      {isCopied ? (
                        <Check className="size-4 text-[#050505]" />
                      ) : (
                        <Copy className="size-4 text-[#6b7280]" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <button
            type="button"
            onClick={handleCopySelected}
            className="flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#050505] px-4 text-base font-medium text-white hover:bg-[#262626]"
          >
            <ListChecks className="size-4 shrink-0" />
            Скопировать выбранные{selected.length > 0 ? ` (${selected.length})` : ""}
          </button>
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#f6f6f6] px-4 text-base font-medium text-[#050505] hover:bg-[#ebebeb]"
          >
            <Copy className="size-4 shrink-0" />
            Скопировать все ({queries.length})
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
