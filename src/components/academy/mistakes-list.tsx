import { X } from "lucide-react";

interface MistakesListProps {
  items: string[];
  title?: string;
}

export function MistakesList({ items, title = "Строго запрещено" }: MistakesListProps) {
  return (
    <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
      <h3 className="text-base font-semibold text-[#18181b]">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-[#18181b]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
              <X className="size-3 text-[#71717a]" strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
