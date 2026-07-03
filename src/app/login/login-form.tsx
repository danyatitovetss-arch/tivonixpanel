"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";
import { useApp } from "@/lib/store";
import { DEMO_USERS } from "@/lib/seed-data";
import { toUserMessage } from "@/lib/errors";

const inputClass =
  "h-12 w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 text-[15px] text-[#050505] shadow-sm shadow-black/[0.02] outline-none transition-colors placeholder:text-[#a3a3a3] focus:border-[#050505]/25 focus:ring-4 focus:ring-[#050505]/[0.04] autofill:shadow-[inset_0_0_0px_1000px_#ffffff] lg:border-white/15 lg:bg-white/5 lg:text-white lg:shadow-none lg:placeholder:text-white/35 lg:focus:border-white/35 lg:focus:ring-white/[0.06] lg:autofill:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.05)]";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const { setCurrentUserId } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveRedirect() {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.push(next);
      return;
    }
    const { user } = await me.json();
    if (user.blockedUnder16) {
      router.push("/blocked");
      return;
    }
    if (!user.onboardingComplete || user.requiresReaccept || !user.crmAccess) {
      router.push(user.requiresReaccept ? "/onboarding/legal?step=documents" : "/onboarding/legal");
      return;
    }
    if (user.mustChangePassword) {
      router.push("/onboarding/set-password");
      return;
    }
    router.push(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isDemoMode()) {
      setCurrentUserId(DEMO_USERS.partner);
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await resolveRedirect();
    } catch (err) {
      setError(toUserMessage(err, "Не удалось войти. Проверьте email и пароль"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-5 py-8 lg:min-h-screen lg:items-stretch lg:justify-start lg:p-0">
      <div className="flex w-full max-w-[380px] flex-col items-stretch gap-9 lg:max-w-none lg:flex-row lg:gap-0">
        <section className="flex flex-col items-center justify-center lg:flex-1 lg:px-16 lg:py-16 xl:px-24">
          <Image
            src="/images/tl-Photoroom.png"
            alt="TIVONIX Partners CRM"
            width={320}
            height={120}
            priority
            className="h-auto w-[200px] object-contain sm:w-[240px] lg:w-[280px]"
          />
        </section>

        <section className="w-full lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-[#050505] lg:px-16 lg:py-16 lg:text-white xl:px-24">
          <div className="mx-auto w-full max-w-[380px] lg:max-w-sm">
            <div className="mb-7 lg:mb-8">
              <h1 className="text-[1.625rem] font-semibold leading-tight tracking-[-0.02em] text-[#050505] lg:text-2xl lg:text-white">
                Вход в панель
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[13px] font-medium text-[#525252] lg:text-white/75">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-[13px] font-medium text-[#525252] lg:text-white/75">
                  Пароль
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Введите пароль"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 lg:border-red-500/20 lg:bg-red-500/10 lg:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 h-12 w-full rounded-lg bg-[#050505] text-[15px] font-medium text-white transition-all hover:bg-[#171717] active:scale-[0.99] disabled:opacity-50 lg:bg-white lg:text-[#050505] lg:hover:bg-white/90"
              >
                {loading ? "Загрузка…" : "Войти"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-[#a3a3a3] lg:mt-6 lg:text-left lg:text-white/40">
              <Link href="/legal/terms" className="underline-offset-2 hover:text-[#737373] hover:underline lg:hover:text-white/60">
                Условия
              </Link>
              {" · "}
              <Link href="/legal/privacy" className="underline-offset-2 hover:text-[#737373] hover:underline lg:hover:text-white/60">
                Конфиденциальность
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
