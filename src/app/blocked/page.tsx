"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f6] px-6 text-center">
      <h1 className="text-2xl font-semibold text-[#050505]">Доступ ограничен</h1>
      <p className="mt-3 max-w-md text-sm text-[#6b7280]">
        Партнёрская программа TIVONIX доступна с 16 лет. Если вы считаете, что это ошибка — напишите в поддержку.
      </p>
      <Link href="/login" className="mt-6 text-sm text-[#050505] underline">
        Вернуться ко входу
      </Link>
    </div>
  );
}
