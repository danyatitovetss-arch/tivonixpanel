import type { CoreMessageTemplate } from "@/lib/academy-practical-data";
import { CopyButton } from "@/components/academy/copy-button";
import { AcademyCardBody } from "@/components/academy/academy-card";

export function CoreTemplatesSection({ templates }: { templates: CoreMessageTemplate[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {templates.map((template) => (
        <AcademyCardBody key={template.id} className="flex flex-col">
          <h3 className="font-semibold text-[#050505]">{template.title}</h3>
          <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-[#6b7280]">
            {template.text}
          </p>
          <div className="mt-4">
            <CopyButton text={template.text} label="Скопировать" className="w-full sm:w-auto" />
          </div>
        </AcademyCardBody>
      ))}
    </div>
  );
}
