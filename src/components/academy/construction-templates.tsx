import { CopyButton } from "@/components/academy/copy-button";

interface ConstructionTemplate {
  id: string;
  title: string;
  text: string;
}

interface ConstructionTemplatesProps {
  templates: ConstructionTemplate[];
}

export function ConstructionTemplates({ templates }: ConstructionTemplatesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {templates.map((template, i) => (
        <div key={template.id} className="flex flex-col rounded-2xl bg-[#f4f4f5] p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#18181b]">
              {i + 1}
            </span>
            <h3 className="font-semibold text-[#18181b]">{template.title}</h3>
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[#71717a]">{template.text}</p>
          <div className="mt-4">
            <CopyButton text={template.text} label="Скопировать" className="w-full sm:w-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
