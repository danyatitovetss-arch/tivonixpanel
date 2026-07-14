"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export function AuthNav() {
  const pathname = usePathname();
  const onLogin = pathname === "/login" || pathname.startsWith("/login/");

  return (
    <nav className="mx-auto mb-10 flex w-full max-w-3xl items-center justify-between rounded-[15px] bg-[var(--color-carbon-black)] px-4 py-2.5 text-[var(--color-paper-white)] shadow-[var(--shadow-subtle)] sm:mb-14 sm:px-5 sm:py-3">
      <BrandLogo href="/login" priority />

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/login"
          className={cn(
            "hidden text-[13px] tracking-[-0.005em] transition-colors sm:inline",
            onLogin ? "font-bold text-white" : "text-white/60 hover:text-white"
          )}
        >
          Войти
        </Link>
        <Link
          href="/register"
          className="inline-flex h-9 items-center rounded-[9999px] bg-[var(--color-sunrise-coral)] px-4 text-[13px] font-bold tracking-[-0.009em] text-white transition-opacity hover:opacity-90"
        >
          Стать партнёром
        </Link>
      </div>
    </nav>
  );
}
