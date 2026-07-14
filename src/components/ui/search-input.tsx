"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Поиск…",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717a]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border-[#e4e4e7] bg-white pl-9 text-sm placeholder:text-[#71717a] focus-visible:ring-[#18181b]/10"
      />
    </div>
  );
}
