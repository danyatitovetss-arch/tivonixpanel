import { AcademyCardBody } from "@/components/academy/academy-card";

interface AfterReplyGuideProps {
  questions: string[];
  crmSteps: string[];
}

export function AfterReplyGuide({ questions, crmSteps }: AfterReplyGuideProps) {
  return (
    <div className="space-y-6">
      <AcademyCardBody>
        <h3 className="font-semibold text-[#18181b]">Если клиент ответил «интересно» — задай вопросы</h3>
        <ol className="mt-4 space-y-2">
          {questions.map((q, i) => (
            <li key={q} className="flex gap-3 text-sm text-[#18181b]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">
                {i + 1}
              </span>
              <span className="pt-1">{q}</span>
            </li>
          ))}
        </ol>
      </AcademyCardBody>

      <AcademyCardBody>
        <h3 className="font-semibold text-[#18181b]">После этого — добавь в CRM</h3>
        <ol className="mt-4 space-y-2">
          {crmSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-[#18181b]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </AcademyCardBody>
    </div>
  );
}
