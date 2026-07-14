import type { LeadExampleCard } from "@/lib/academy-practical-data";
import { AcademyCardBody } from "@/components/academy/academy-card";

export function LeadExamplesPractical({
  good,
  bad,
}: {
  good: LeadExampleCard;
  bad: LeadExampleCard;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[good, bad].map((card) => (
        <AcademyCardBody key={card.title}>
          <h3 className="font-semibold text-[#18181b]">{card.title}</h3>
          <dl className="mt-4 space-y-2">
            {card.fields.map((field) => (
              <div key={field.label} className="text-sm">
                <dt className="font-medium text-[#18181b]">{field.label}</dt>
                <dd className="mt-0.5 text-[#71717a]">{field.value}</dd>
              </div>
            ))}
          </dl>
        </AcademyCardBody>
      ))}
    </div>
  );
}
