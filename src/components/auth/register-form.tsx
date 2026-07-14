"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toUserMessage } from "@/lib/errors";
import type { PartnerType } from "@/lib/types";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  authErrorClass,
  authGhostLinkClass,
  authHeadingClass,
  authLabelClass,
  authPrimaryBtnClass,
  authSubheadClass,
} from "@/components/auth/auth-styles";

const PARTNER_OPTIONS: {
  type: PartnerType;
  title: string;
  description: string;
  image: string;
}[] = [
  {
    type: "referral",
    title: "Referral-партнёр",
    description:
      "Передаёте клиента TIVONIX. Мы оцениваем проект, заключаем сделку и выполняем работу. После оплаты заказа вы получаете партнёрское вознаграждение.",
    image: "/images/1.png",
  },
  {
    type: "white_label",
    title: "White-label",
    description:
      "Вы ведёте клиента, продаёте разработку под своим брендом и назначаете конечную цену. TIVONIX выполняет техническую часть и не выходит к клиенту без согласования.",
    image: "/images/2.png",
  },
];

const modalInputClass =
  "h-11 w-full rounded-[12px] border-0 bg-[var(--color-fog-gray)] px-4 text-[15px] leading-[1.5] tracking-[-0.005em] text-[var(--color-carbon-black)] outline-none transition-shadow placeholder:text-[var(--color-ash-gray)] focus:ring-[3px] focus:ring-[var(--color-carbon-black)]/8";

type FormState = {
  fullName: string;
  agencyName: string;
  telegram: string;
  email: string;
  websiteUrl: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const initialForm: FormState = {
  fullName: "",
  agencyName: "",
  telegram: "",
  email: "",
  websiteUrl: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function parsePartnerTypeParam(raw: string | null): PartnerType | null {
  if (raw === "referral" || raw === "white_label") return raw;
  return null;
}

export function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[420px] py-20 text-center text-sm text-[var(--color-zinc-gray)]">
          Загрузка…
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = useMemo(
    () => parsePartnerTypeParam(searchParams.get("type") ?? searchParams.get("partner_type")),
    [searchParams]
  );
  const [partnerType, setPartnerType] = useState<PartnerType | null>(initialType);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"pending" | "confirm_email" | null>(null);

  const modalOpen = partnerType !== null && done !== "confirm_email";

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function closeModal() {
    setPartnerType(null);
    setError(null);
    setFieldErrors({});
  }

  function validateClient(): string | null {
    if (!partnerType) return "Выберите формат сотрудничества";
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      return "Укажите имя и фамилию";
    }
    if (!form.telegram.trim()) return "Укажите Telegram";
    if (!form.email.trim()) return "Укажите email";
    if (form.password.length < 8) return "Пароль — минимум 8 символов";
    if (form.password !== form.confirmPassword) return "Пароли не совпадают";
    if (!form.acceptTerms) {
      return "Необходимо принять условия и политику конфиденциальности";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const clientError = validateClient();
    if (clientError) {
      setError(clientError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          agencyName: form.agencyName.trim() || null,
          telegram: form.telegram.trim(),
          email: form.email.trim(),
          websiteUrl: form.websiteUrl.trim() || null,
          password: form.password,
          confirmPassword: form.confirmPassword,
          partnerType,
          acceptTerms: form.acceptTerms,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Record<string, string[]>;
        data?: { needsEmailConfirmation?: boolean };
      };

      if (!res.ok) {
        if (json.fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(json.fieldErrors)) {
            if (messages?.[0]) mapped[key] = messages[0];
          }
          setFieldErrors(mapped);
        }
        throw new Error(json.error ?? "Не удалось отправить заявку");
      }

      if (json.data?.needsEmailConfirmation) {
        setDone("confirm_email");
      } else {
        setDone("pending");
        router.push("/pending");
        router.refresh();
      }
    } catch (err) {
      setError(toUserMessage(err, "Не удалось отправить заявку"));
    } finally {
      setLoading(false);
    }
  }

  if (done === "confirm_email") {
    return (
      <div className="mx-auto w-full max-w-lg rounded-[15px] bg-[var(--color-paper-white)] p-8 text-center shadow-[var(--shadow-subtle)]">
        <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-[7.5px] bg-[var(--color-fog-gray)]">
          <Check className="size-5 text-[var(--color-sunrise-coral)]" strokeWidth={2} />
        </div>
        <h2 className="text-[22px] font-normal leading-[1.25] tracking-[-0.012em] text-[var(--color-carbon-black)]">
          Подтвердите email
        </h2>
        <p className="mt-3 text-[15px] leading-[1.5] tracking-[-0.005em] text-[var(--color-zinc-gray)]">
          Мы отправили письмо на {form.email}. Перейдите по ссылке, затем войдите — заявка будет на
          проверке.
        </p>
        <Link href="/login" className={cn(authPrimaryBtnClass, "mt-7")}>
          Перейти ко входу
          <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  const partnerLabel = partnerType === "referral" ? "Referral-партнёр" : "White-label";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-10 text-left">
        <p className="mb-3 font-[family-name:var(--font-auth-mono)] text-[11px] uppercase tracking-[-0.006em] text-[var(--color-ash-gray)]">
          TIVONIX Partners
        </p>
        <h1 className={authHeadingClass}>Стать партнёром TIVONIX</h1>
        <p className={authSubheadClass}>
          Выберите формат сотрудничества и отправьте заявку. После проверки мы откроем вам доступ к
          партнёрской панели.
        </p>
      </div>

      <div className="grid gap-[11px] sm:grid-cols-2">
        {PARTNER_OPTIONS.map((option) => {
          const selected = partnerType === option.type;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => setPartnerType(option.type)}
              aria-pressed={selected}
              className={cn(
                "relative overflow-hidden rounded-[15px] border text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-[var(--color-sunrise-coral)]/25",
                selected
                  ? "border-[var(--color-sunrise-coral)] shadow-[0_0_0_1px_var(--color-sunrise-coral)]"
                  : "border-[var(--color-mist-gray)] hover:border-[var(--color-ash-gray)]"
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 scale-110 bg-[url('/images/fon-hero.png')] bg-cover bg-center opacity-80 blur-[14px]"
              />
              <div className="relative bg-[var(--color-paper-white)]/80">
                <div
                  className="relative aspect-[16/10] w-full"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 70%, transparent 100%)",
                    maskComposite: "intersect",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 70%, transparent 100%)",
                    WebkitMaskComposite: "source-in",
                  }}
                >
                  <Image
                    src={option.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-contain object-center p-1"
                    priority
                  />
                </div>
                <div className="relative p-[19px] pt-2">
                  <p className="text-[19px] font-normal leading-[1.4] tracking-[-0.009em] text-[var(--color-carbon-black)]">
                    {option.title}
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.5] tracking-[-0.005em] text-[var(--color-zinc-gray)]">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[13px] text-[var(--color-zinc-gray)]">
        Уже зарегистрированы?{" "}
        <Link href="/login" className={cn(authGhostLinkClass, "font-bold text-[var(--color-carbon-black)]")}>
          Войти
        </Link>
      </p>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className={cn(
            "max-h-[min(96dvh,900px)] gap-0 overflow-hidden border-0 p-0 shadow-[0_24px_80px_rgba(24,24,27,0.18)] sm:max-w-2xl",
            "bg-[var(--color-paper-white)] ring-0"
          )}
        >
          <div className="px-6 pt-5 pb-1 sm:px-8">
            <DialogHeader>
              <DialogTitle className="font-normal">Заявка на партнёрство</DialogTitle>
              <DialogDescription>
                Выбранный формат:{" "}
                <span className="font-bold text-[var(--color-carbon-black)]">{partnerLabel}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 px-6 pb-6 pt-2 sm:px-8">
            <input type="hidden" name="partnerType" value={partnerType ?? ""} />

            <div className="space-y-1.5">
              <label htmlFor="reg-full-name" className={authLabelClass}>
                Имя и фамилия
              </label>
              <input
                id="reg-full-name"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={modalInputClass}
                placeholder="Иван Иванов"
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-[var(--color-sunrise-coral)]">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="reg-agency" className={authLabelClass}>
                  Агентство / бренд{" "}
                  <span className="text-[var(--color-ash-gray)]">(необяз.)</span>
                </label>
                <input
                  id="reg-agency"
                  autoComplete="organization"
                  value={form.agencyName}
                  onChange={(e) => updateField("agencyName", e.target.value)}
                  className={modalInputClass}
                  placeholder="Agency Studio"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-website" className={authLabelClass}>
                  Сайт{" "}
                  <span className="text-[var(--color-ash-gray)]">(необяз.)</span>
                </label>
                <input
                  id="reg-website"
                  type="text"
                  value={form.websiteUrl}
                  onChange={(e) => updateField("websiteUrl", e.target.value)}
                  className={modalInputClass}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="reg-telegram" className={authLabelClass}>
                  Telegram
                </label>
                <input
                  id="reg-telegram"
                  required
                  value={form.telegram}
                  onChange={(e) => updateField("telegram", e.target.value)}
                  className={modalInputClass}
                  placeholder="@username"
                />
                {fieldErrors.telegram && (
                  <p className="text-[11px] text-[var(--color-sunrise-coral)]">{fieldErrors.telegram}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className={authLabelClass}>
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={modalInputClass}
                  placeholder="name@company.com"
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-[var(--color-sunrise-coral)]">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className={authLabelClass}>
                  Пароль
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={modalInputClass}
                  placeholder="Минимум 8 символов"
                />
                {fieldErrors.password && (
                  <p className="text-[11px] text-[var(--color-sunrise-coral)]">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className={authLabelClass}>
                  Повтор пароля
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={modalInputClass}
                  placeholder="Повторите пароль"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-[var(--color-sunrise-coral)]">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-[12px] bg-[var(--color-fog-gray)] px-3.5 py-3">
              <Checkbox
                checked={form.acceptTerms}
                onCheckedChange={(checked) => updateField("acceptTerms", checked === true)}
                className="mt-0.5 border-[var(--color-mist-gray)] data-checked:border-[var(--color-sunrise-coral)] data-checked:bg-[var(--color-sunrise-coral)]"
                aria-label="Принять условия"
              />
              <span className="text-[13px] leading-[1.45] text-[var(--color-zinc-gray)]">
                Принимаю{" "}
                <Link
                  href="/legal/terms"
                  className="text-[var(--color-carbon-black)] underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  условия
                </Link>{" "}
                и{" "}
                <Link
                  href="/legal/privacy"
                  className="text-[var(--color-carbon-black)] underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  политику конфиденциальности
                </Link>
                . Версии документов фиксируются при отправке заявки.
              </span>
            </label>

            {error && <div className={cn(authErrorClass, "border-0")}>{error}</div>}

            <button type="submit" disabled={loading} className={cn(authPrimaryBtnClass, "h-11")}>
              {loading ? "Отправка…" : "Отправить заявку"}
              {!loading && <ArrowRight className="size-4" strokeWidth={2} />}
            </button>

            <p className="text-center text-[13px] text-[var(--color-zinc-gray)]">
              Уже зарегистрированы?{" "}
              <Link
                href="/login"
                className={cn(authGhostLinkClass, "font-bold text-[var(--color-carbon-black)]")}
              >
                Войти
              </Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RegisterPageShell({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
