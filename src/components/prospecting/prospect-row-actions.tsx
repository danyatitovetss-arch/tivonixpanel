"use client";

import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProspectContact } from "@/lib/prospecting-types";

interface ProspectRowActionsProps {
  prospect: ProspectContact;
  onOpen: () => void;
  onMarkMessaged: () => void;
  onDelete: () => void;
  onConvert: () => void;
}

export function ProspectRowActions({
  prospect,
  onOpen,
  onMarkMessaged,
  onDelete,
  onConvert,
}: ProspectRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-9 items-center justify-center rounded-xl bg-[#f4f4f5] text-[#18181b] transition-colors hover:bg-[#ebebeb] data-popup-open:bg-[#ebebeb]"
        aria-label="Действия"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-44 rounded-xl border-0 bg-white p-1.5 shadow-none ring-1 ring-[#ebebeb]"
      >
        <DropdownMenuItem
          onClick={onOpen}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#18181b] focus:bg-[#f4f4f5]"
        >
          Открыть
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onMarkMessaged}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#18181b] focus:bg-[#f4f4f5]"
        >
          Отметить «Написали»
        </DropdownMenuItem>
        {prospect.status !== "converted_to_lead" && (
          <DropdownMenuItem
            onClick={onConvert}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#18181b] focus:bg-[#f4f4f5]"
          >
            Добавить в лиды
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-1 bg-[#ebebeb]" />
        <DropdownMenuItem
          variant="destructive"
          onClick={onDelete}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm focus:bg-[#f4f4f5]"
        >
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
