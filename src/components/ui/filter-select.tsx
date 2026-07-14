"use client";

import {
  Select,
  SelectContent,
  SelectFieldText,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

const triggerClass =
  "h-11 w-full justify-between gap-2 rounded-xl border-0 bg-[#f4f4f5] px-3.5 shadow-none ring-0 transition-colors hover:bg-[#f4f4f5] focus-visible:border-0 focus-visible:bg-[#f4f4f5] focus-visible:ring-0 data-placeholder:text-[#9ca3af] [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left [&_svg]:ml-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#9ca3af]";

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Все",
  className,
}: FilterSelectProps) {
  const allOptions = [{ value: "all", label: placeholder }, ...options];
  const selectValue = value === "all" ? null : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onChange(v ?? "all")}
    >
      <SelectTrigger className={cn(triggerClass, className)}>
        <SelectFieldText value={selectValue} placeholder={placeholder} options={allOptions} />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        align="start"
        sideOffset={8}
        alignItemWithTrigger={false}
        className="rounded-xl border-0 bg-white p-1.5 shadow-[0_8px_30px_rgba(5,5,5,0.08)] ring-0"
      >
        <SelectItem
          value="all"
          className="rounded-lg py-2.5 pl-3 pr-9 text-sm data-highlighted:bg-[#f4f4f5]"
        >
          {placeholder}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg py-2.5 pl-3 pr-9 text-sm data-highlighted:bg-[#f4f4f5]"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
