"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Пароль — минимум 8 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(toUserMessage(err, "Не удалось обновить пароль"));
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-8">
          <h1 className={authHeadingClass}>Новый пароль</h1>
          <p className={authSubheadClass}>Придумайте новый пароль для входа в панель.</p>
        </div>

        <form onSubmit={handleSubmit} className={cn(authCardClass, "space-y-[11px] sm:p-7")}>
          <div className="space-y-1.5">
            <label htmlFor="reset-password" className={authLabelClass}>
              Пароль
            </label>
            <input
              id="reset-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reset-confirm" className={authLabelClass}>
              Повтор пароля
            </label>
            <input
              id="reset-confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
          {error && <div className={authErrorClass}>{error}</div>}
          <button type="submit" disabled={loading} className={authPrimaryBtnClass}>
            {loading ? "Сохранение…" : "Сохранить пароль"}
            {!loading && <ArrowRight className="size-4" strokeWidth={2} />}
          </button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[var(--color-zinc-gray)]">
          <Link href="/login" className={cn(authGhostLinkClass, "font-bold text-[var(--color-carbon-black)]")}>
            Ко входу
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
