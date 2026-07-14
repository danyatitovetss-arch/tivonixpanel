import type { MessageTemplate } from "@/lib/academy-data";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";

interface TemplateCardProps {
  template: MessageTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-[#f4f4f5] p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-[#18181b]">{template.title}</h3>
        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-[#71717a]">
          {TEMPLATE_CATEGORY_LABELS[template.category]}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#71717a]">{template.text}</p>
      <div className="mt-4">
        <CopyButton text={template.text} label="Скопировать шаблон" className="w-full sm:w-auto" />
      </div>
    </div>
  );
}
