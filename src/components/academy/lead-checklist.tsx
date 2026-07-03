import { Check } from "lucide-react";

interface LeadChecklistProps {
  title: string;
  items: string[];
  conclusion?: string;
}

export function LeadChecklist({ title, items, conclusion }: LeadChecklistProps) {
  return (
    <div className="rounded-2xl bg-[#f6f6f6] p-5 md:p-6">
      <h3 className="text-base font-semibold text-[#050505]">{title}</h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-[#050505]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
              <Check className="size-3 text-[#6b7280]" strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>
      {conclusion && (
        <p className="mt-5 rounded-xl bg-white p-4 text-sm leading-relaxed text-[#6b7280]">
          {conclusion}
        </p>
      )}
    </div>
  );
}
