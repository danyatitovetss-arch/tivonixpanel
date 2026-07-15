"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-paper-white)] px-6 text-center text-[var(--color-carbon-black)]">
      <h1 className="text-[28px] font-normal tracking-[-0.02em]">Что-то пошло не так</h1>
      <p className="mt-3 max-w-md text-[15px] text-[var(--color-zinc-gray)]">
        Не удалось отобразить страницу. Попробуйте обновить или вернуться ко входу.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-sunrise-coral)] px-6 text-[15px] font-bold text-white"
        >
          Попробовать снова
        </button>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#f4f4f5] px-6 text-[15px] font-medium"
        >
          На вход
        </Link>
      </div>
    </main>
  );
}
