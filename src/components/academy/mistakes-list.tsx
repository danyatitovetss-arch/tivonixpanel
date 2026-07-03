import { X } from "lucide-react";

interface MistakesListProps {
  items: string[];
}

export function MistakesList({ items }: MistakesListProps) {
  return (
    <div className="rounded-2xl bg-[#f6f6f6] p-5 md:p-6">
      <h3 className="text-base font-semibold text-[#050505]">Строго запрещено</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-[#050505]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
              <X className="size-3 text-[#6b7280]" strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
