import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

const FIELD_LABELS: Record<string, string> = {
  fullName: "ФИО",
  email: "Email",
  telegram: "Telegram",
  phone: "Телефон",
  password: "Пароль",
  confirmPassword: "Повтор пароля",
  partnerType: "Тип партнёрства",
  acceptTerms: "Согласие с условиями",
  agencyName: "Агентство",
  websiteUrl: "Сайт",
};

function translateIssueMessage(message: string): string {
  const exact: Record<string, string> = {
    Required: "Обязательное поле",
    "Invalid email": "Введите корректный email",
    "Invalid option: expected one of \"referral\"|\"white_label\"":
      "Выберите тип партнёрства",
    "Invalid input: expected string, received undefined": "Заполните поле",
    "Invalid input: expected boolean, received undefined": "Необходимо принять условие",
  };
  if (exact[message]) return exact[message];
  if (/expected string/i.test(message)) return "Заполните поле";
  if (/expected boolean/i.test(message)) return "Необходимо принять условие";
  if (/Invalid email/i.test(message)) return "Введите корректный email";
  if (/at least (\d+)/i.test(message)) {
    const n = message.match(/at least (\d+)/i)?.[1];
    return `Минимум ${n} символов`;
  }
  if (/Invalid option/i.test(message)) return "Выберите значение из списка";
  if (/Invalid literal/i.test(message)) return "Необходимо принять условие";
  return "Проверьте значение поля";
}

export function zodToFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  for (const [field, messages] of Object.entries(flat)) {
    const msg = messages?.[0];
    if (!msg) continue;
    out[field] = translateIssueMessage(msg);
  }
  return out;
}

export function validationErrorResponse(error: ZodError, status = 400) {
  const fieldErrors = zodToFieldErrors(error);
  const firstField = Object.keys(fieldErrors)[0];
  const firstMessage = firstField
    ? `${FIELD_LABELS[firstField] ?? firstField}: ${fieldErrors[firstField]}`
    : "Проверьте введённые данные";

  return NextResponse.json(
    {
      code: "VALIDATION_ERROR",
      message: firstMessage,
      error: firstMessage,
      fieldErrors,
      requestId: randomUUID(),
    },
    { status }
  );
}

export function apiErrorJson(
  message: string,
  status: number,
  extra?: { code?: string; fieldErrors?: Record<string, string> }
) {
  return NextResponse.json(
    {
      code: extra?.code ?? (status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "ERROR"),
      message,
      error: message,
      fieldErrors: extra?.fieldErrors,
      requestId: randomUUID(),
    },
    { status }
  );
}
