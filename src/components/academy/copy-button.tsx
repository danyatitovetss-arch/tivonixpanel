"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  toastMessage?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "Скопировать",
  toastMessage = "Шаблон скопирован",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#f4f4f5] px-4 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#ebebeb]",
        className
      )}
    >
      {copied ? <Check className="size-4 shrink-0" /> : <Copy className="size-4 shrink-0" />}
      <span>{copied ? "Скопировано" : label}</span>
    </button>
  );
}
