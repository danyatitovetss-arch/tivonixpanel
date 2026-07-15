import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-paper-white)] px-6 text-center text-[var(--color-carbon-black)]">
      <p className="mb-3 font-[family-name:var(--font-auth-mono)] text-[11px] uppercase tracking-[-0.006em] text-[var(--color-ash-gray)]">
        TIVONIX Partners
      </p>
      <h1 className="text-[40px] font-normal leading-none tracking-[-0.02em]">404</h1>
      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[var(--color-zinc-gray)]">
        Такой страницы нет. Проверьте адрес или вернитесь на вход в панель.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-sunrise-coral)] px-6 text-[15px] font-bold text-white"
        >
          Войти
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#f4f4f5] px-6 text-[15px] font-medium text-[#18181b]"
        >
          Стать партнёром
        </Link>
      </div>
    </main>
  );
}
