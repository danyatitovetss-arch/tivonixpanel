import type { AcademyNiche } from "@/lib/academy-data";

interface NicheCardProps {
  niche: AcademyNiche;
}

export function NicheCard({ niche }: NicheCardProps) {
  return (
    <div className="rounded-2xl bg-[#f6f6f6] p-5">
      <h3 className="font-semibold text-[#050505]">{niche.name}</h3>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Можно предложить</p>
          <ul className="mt-1.5 space-y-1">
            {niche.offers.map((o) => (
              <li key={o} className="text-sm text-[#050505]">· {o}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Признаки</p>
          <ul className="mt-1.5 space-y-1">
            {niche.signs.map((s) => (
              <li key={s} className="text-sm text-[#6b7280]">· {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
