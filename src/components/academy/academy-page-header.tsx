import Image from "next/image";

export function AcademyPageHeader() {
  return (
    <header className="space-y-5 pb-2">
      <Image
        src="/images/tl-Photoroom.png"
        alt="TIVONIX"
        width={180}
        height={48}
        priority
        className="h-8 w-auto object-contain sm:h-9"
      />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
          TIVONIX Partners · Академия
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#050505] sm:text-3xl">
          Как искать клиентов
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
          Пошаговая инструкция для партнёров: где находить бизнесы, что им писать, как передавать
          лиды в CRM и как получать комиссию.
        </p>
      </div>
    </header>
  );
}
