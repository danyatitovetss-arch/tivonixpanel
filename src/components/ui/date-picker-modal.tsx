"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectFieldText,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const pickerSelectTrigger =
  "h-10 w-full justify-between gap-2 rounded-xl border-0 bg-[#f4f4f5] px-3 shadow-none ring-0 transition-colors hover:bg-[#f4f4f5] focus-visible:border-0 focus-visible:bg-[#f4f4f5] focus-visible:ring-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left [&_svg]:ml-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#9ca3af]";

const pickerSelectContent =
  "z-[200] max-h-56 rounded-xl border-0 bg-white p-1.5 shadow-[0_8px_30px_rgba(5,5,5,0.08)] ring-0";

const pickerSelectItem = "rounded-lg py-2.5 pl-3 pr-9 text-sm data-highlighted:bg-[#f4f4f5]";

const navButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg text-[#71717a] transition-colors hover:bg-[#f4f4f5] hover:text-[#18181b]";

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(iso: string) {
  const d = parseIso(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface DatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  variant?: "default" | "birth";
}

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export function DatePickerModal({
  open,
  onOpenChange,
  value,
  onChange,
  title = "Выберите дату",
  variant = "default",
}: DatePickerModalProps) {
  const today = new Date();
  const defaultBirthYear = today.getFullYear() - 25;
  const initial = value ? parseIso(value) : variant === "birth" ? new Date(defaultBirthYear, 0, 1) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [wasOpen, setWasOpen] = useState(open);

  const minBirthYear = today.getFullYear() - 100;
  const maxBirthYear = today.getFullYear();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const now = new Date();
      const d = value
        ? parseIso(value)
        : variant === "birth"
          ? new Date(now.getFullYear() - 25, 0, 1)
          : now;
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const days = (() => {
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay; d++) cells.push(d);
    return cells;
  })();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function isDisabledDay(day: number) {
    if (variant !== "birth") return false;
    const iso = toIso(viewYear, viewMonth, day);
    return iso > toIso(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function pick(day: number) {
    if (isDisabledDay(day)) return;
    onChange(toIso(viewYear, viewMonth, day));
    onOpenChange(false);
  }

  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());
  const birthYears: number[] = [];
  for (let y = maxBirthYear; y >= minBirthYear; y--) birthYears.push(y);

  const monthOptions = MONTHS.map((label, i) => ({ value: String(i), label }));
  const yearOptions = birthYears.map((y) => ({ value: String(y), label: String(y) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[340px] rounded-2xl border-0 bg-white p-5 shadow-[0_16px_48px_rgba(5,5,5,0.12)] ring-0"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#18181b]">{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {variant === "birth" ? (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Select
                value={String(viewMonth)}
                onValueChange={(v) => setViewMonth(Number(v))}
              >
                <SelectTrigger className={pickerSelectTrigger}>
                  <SelectFieldText
                    value={String(viewMonth)}
                    placeholder="Месяц"
                    options={monthOptions}
                  />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  alignItemWithTrigger={false}
                  className={pickerSelectContent}
                >
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className={pickerSelectItem}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(viewYear)}
                onValueChange={(v) => setViewYear(Number(v))}
              >
                <SelectTrigger className={pickerSelectTrigger}>
                  <SelectFieldText
                    value={String(viewYear)}
                    placeholder="Год"
                    options={yearOptions}
                  />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  alignItemWithTrigger={false}
                  className={pickerSelectContent}
                >
                  {yearOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className={pickerSelectItem}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className={navButtonClass}
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </button>
              <span className="flex-1 text-center text-sm font-medium capitalize text-[#18181b]">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className={navButtonClass}
                aria-label="Следующий месяц"
              >
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#9ca3af]">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <span key={`e-${i}`} />;
              const iso = toIso(viewYear, viewMonth, day);
              const selected = value === iso;
              const isToday = iso === todayIso;
              const disabled = isDisabledDay(day);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(day)}
                  disabled={disabled}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                    disabled && "cursor-not-allowed text-[#d1d5db]",
                    !disabled && selected && "bg-[var(--color-sunrise-coral)] font-medium text-white",
                    !disabled &&
                      !selected &&
                      isToday &&
                      "bg-[#f4f4f5] font-medium text-[#18181b]",
                    !disabled && !selected && !isToday && "text-[#18181b] hover:bg-[#f4f4f5]"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  onOpenChange(false);
                }}
                className="h-10 flex-1 rounded-xl bg-[#f4f4f5] text-sm font-medium text-[#18181b] hover:bg-[#f4f4f5]"
              >
                Сбросить
              </button>
            )}
            {variant === "default" && (
              <button
                type="button"
                onClick={() => {
                  onChange(todayIso);
                  onOpenChange(false);
                }}
                className="h-10 flex-1 rounded-full bg-[var(--color-sunrise-coral)] text-sm font-medium text-white hover:opacity-90"
              >
                Сегодня
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function formatFilterDate(iso: string) {
  if (!iso) return "";
  return formatDisplay(iso);
}

interface DateFilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "default" | "birth";
  placeholder?: string;
}

export function DateFilterField({
  label,
  value,
  onChange,
  className,
  variant = "default",
  placeholder,
}: DateFilterFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl bg-[#f4f4f5] px-3.5 text-sm transition-colors hover:bg-[#f4f4f5]",
          className
        )}
      >
        <span className={value ? "text-[#18181b]" : "text-[#9ca3af]"}>
          {value ? formatDisplay(value) : (placeholder ?? label)}
        </span>
      </button>
      <DatePickerModal
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
        title={label}
        variant={variant}
      />
    </>
  );
}
