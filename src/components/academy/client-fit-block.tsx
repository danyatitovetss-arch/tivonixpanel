import { cn } from "@/lib/utils";

function FitCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "yes" | "no";
}) {
  const isYes = variant === "yes";

  return (
    <div
      className={cn(
        "rounded-2xl bg-[#f4f4f5] p-5 ring-2 ring-offset-[3px] ring-offset-white md:p-6",
        isYes ? "ring-emerald-500" : "ring-red-500"
      )}
    >
      <h3
        className={cn(
          "text-base font-semibold md:text-lg",
          isYes ? "text-emerald-700" : "text-red-600"
        )}
      >
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-base leading-snug text-[#18181b] md:text-[17px]">
            <span
              className={cn(
                "mt-0.5 shrink-0 text-sm font-bold",
                isYes ? "text-emerald-600" : "text-red-500"
              )}
              aria-hidden
            >
              {isYes ? "✓" : "✕"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClientFitBlock({ yesItems, noItems }: { yesItems: string[]; noItems: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FitCard title="Писать можно, если" items={yesItems} variant="yes" />
      <FitCard title="Не тратить время, если" items={noItems} variant="no" />
    </div>
  );
}
