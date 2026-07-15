"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toUserMessage } from "@/lib/errors";

const inputClass =
  "h-12 w-full rounded-lg border border-[#e4e4e7] bg-[#f4f4f5] px-3.5 text-[15px] text-[#18181b] outline-none focus:border-[#18181b]/25 focus:ring-4 focus:ring-[#18181b]/[0.04]";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.user) {
          router.replace("/login");
          return;
        }
        if (!json.user.mustChangePassword) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(toUserMessage(data.error, "Не удалось сохранить пароль"));
      setLoading(false);
      return;
    }

    await fetch("/api/auth/me");
    router.push("/dashboard");
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[#71717a]">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#18181b]">Создайте свой пароль</h1>
        <p className="mt-2 text-sm text-[#71717a]">
          Оформление завершено. Придумайте личный пароль для входа в панель — временный пароль от админа больше не понадобится.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-[13px] font-medium text-[#71717a]">
            Новый пароль
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Минимум 8 символов"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-[13px] font-medium text-[#71717a]">
            Повторите пароль
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Ещё раз"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-[var(--color-sunrise-coral)] text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Сохранение…" : "Сохранить и войти"}
        </button>
      </form>
    </div>
  );
}
