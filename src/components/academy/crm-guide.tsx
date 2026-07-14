import type { CrmStep } from "@/lib/academy-data";
import { CopyButton } from "@/components/academy/copy-button";

interface CrmGuideProps {
  steps: CrmStep[];
  commentExamples: string[];
  onAddClient?: () => void;
}

export function CrmGuide({ steps, commentExamples, onAddClient }: CrmGuideProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <h3 className="text-base font-semibold text-[#18181b]">Пошаговая инструкция</h3>
        <ol className="mt-4 space-y-3">
          {steps.map((step) => (
            <li key={step.step} className="flex gap-3 text-sm text-[#18181b]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">
                {step.step}
              </span>
              <span className="pt-1">{step.text}</span>
            </li>
          ))}
        </ol>
        {onAddClient && (
          <button
            type="button"
            onClick={onAddClient}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-sunrise-coral)] px-5 text-sm font-medium text-white sm:w-auto"
          >
            Добавить клиента
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[#f4f4f5] p-5 md:p-6">
        <h3 className="text-base font-semibold text-[#18181b]">Хороший комментарий в CRM</h3>
        <p className="mt-2 text-sm text-[#71717a]">
          Чем подробнее комментарий — тем быстрее команда TIVONIX разберёт клиента.
        </p>
        <div className="mt-4 space-y-3">
          {commentExamples.map((example) => (
            <div key={example} className="rounded-xl bg-white p-4">
              <p className="text-sm text-[#71717a]">{example}</p>
              <div className="mt-3">
                <CopyButton text={example} label="Скопировать" className="w-full sm:w-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
