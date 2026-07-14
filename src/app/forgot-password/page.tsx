"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toUserMessage } from "@/lib/errors";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  authCardClass,
  authErrorClass,
  authGhostLinkClass,
  authHeadingClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
  authSubheadClass,
} from "@/components/auth/auth-styles";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(toUserMessage(err, "Не удалось отправить письмо"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-8">
          <h1 className={authHeadingClass}>Восстановление пароля</h1>
          <p className={authSubheadClass}>
            Укажите email — мы отправим ссылку для сброса пароля.
          </p>
        </div>

        {sent ? (
          <div className={cn(authCardClass, "text-[15px] text-[var(--color-zinc-gray)]")}>
            Если аккаунт с таким email существует, письмо отправлено. Проверьте почту.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={cn(authCardClass, "space-y-[11px] sm:p-7")}>
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className={authLabelClass}>
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClass}
                placeholder="name@company.com"
              />
            </div>
            {error && <div className={authErrorClass}>{error}</div>}
            <button type="submit" disabled={loading} className={authPrimaryBtnClass}>
              {loading ? "Отправка…" : "Отправить ссылку"}
              {!loading && <ArrowRight className="size-4" strokeWidth={2} />}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-[13px] text-[var(--color-zinc-gray)]">
          <Link href="/login" className={cn(authGhostLinkClass, "font-bold text-[var(--color-carbon-black)]")}>
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
