import { SELECTION_PAYOUT } from "@/lib/academy-practical-data";
import { AcademyCardBody } from "@/components/academy/academy-card";

export function SelectionPayoutBlock() {
  const data = SELECTION_PAYOUT;

  return (
    <div className="space-y-4">
      <AcademyCardBody>
        <h3 className="text-lg font-semibold text-[#050505]">{data.title}</h3>
        <p className="mt-2 text-sm text-[#6b7280] md:text-base">{data.intro}</p>
        <ul className="mt-4 space-y-2">
          {data.tiers.map((tier) => (
            <li key={tier} className="text-base font-medium text-[#050505]">
              — {tier}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-[#6b7280] md:text-base">{data.teamNote}</p>
        <p className="mt-3 rounded-xl bg-[#050505] px-4 py-3 text-sm font-medium text-white md:text-base">
          {data.topNote}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#6b7280]">{data.criteria}</p>
        <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-[#6b7280]">{data.gapNote}</p>
      </AcademyCardBody>

      <AcademyCardBody>
        <h3 className="font-semibold text-[#050505]">Как получить выплату</h3>
        <ol className="mt-4 space-y-2">
          {data.payoutSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-[#050505]">
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
