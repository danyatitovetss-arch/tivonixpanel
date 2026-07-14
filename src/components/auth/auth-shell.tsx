"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let frame = 0;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onScroll() {
      if (prefersReduced) {
        setScale(1);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScale(Math.min(1.14, 1 + y / 3200));
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "auth-surface relative isolate min-h-dvh overflow-x-hidden bg-[var(--color-paper-white)] text-[var(--color-carbon-black)] antialiased",
        "font-[family-name:var(--font-auth-sans)]",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 origin-center will-change-transform"
          style={{ transform: `scale(${scale})` }}
        >
          <Image
            src="/images/fon-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col px-5 pb-16 pt-5 sm:px-8 sm:pt-6">
        <AuthNav />
        {children}
      </div>
    </div>
  );
}
