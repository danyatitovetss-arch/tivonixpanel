"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  authCardClass,
  authGhostLinkClass,
  authHeadingClass,
  authSubheadClass,
} from "@/components/auth/auth-styles";

function BlockedInner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isAge = reason === "under_16";

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-[480px]">
        <div className={authCardClass}>
          <h1 className={authHeadingClass}>Доступ ограничен</h1>
          <p className={authSubheadClass}>
            {isAge
              ? "Партнёрская программа TIVONIX доступна с 16 лет. Если вы считаете, что это ошибка — напишите в поддержку."
              : "Ваш аккаунт заблокирован или приостановлен. Если это ошибка — напишите в поддержку."}
          </p>
          <p className="mt-6">
            <Link href="/login" className={authGhostLinkClass}>
              Вернуться ко входу
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

export default function BlockedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-[#71717a]">
          Загрузка…
        </div>
      }
    >
      <BlockedInner />
    </Suspense>
  );
}
