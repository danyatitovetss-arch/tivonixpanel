import Image from "next/image";

export function AcademyPageHeader() {
  return (
    <header className="flex flex-col items-center pb-4 pt-2 text-center">
      <Image
        src="/images/tl-Photoroom.png"
        alt="TIVONIX"
        width={360}
        height={96}
        priority
        className="h-16 w-auto object-contain sm:h-[4.5rem]"
      />
      <div className="mt-5 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af] sm:text-sm">
          TIVONIX Partners · Академия
        </p>
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#18181b] sm:text-sm">
          Второе обновление
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#18181b] sm:text-3xl">
          Как искать клиентов
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#71717a] sm:text-base">
          Переработали раздел для вашего удобства: где искать, что писать, как добавить лида в CRM и
          получить выплату.
        </p>
      </div>
    </header>
  );
}
