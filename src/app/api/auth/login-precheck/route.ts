import { NextResponse } from "next/server";
import { z } from "zod";
import { allowLoginAttempt } from "@/lib/auth/rate-limit";
import { apiErrorJson, validationErrorResponse } from "@/lib/api/validation-response";

const bodySchema = z.object({
  email: z.string().email(),
});

/**
 * Pre-login rate-limit gate. Client must call this before signInWithPassword.
 * Does not authenticate — only throttles brute force.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiErrorJson("Некорректный запрос", 400, { code: "BAD_REQUEST" });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const rate = await allowLoginAttempt(request, parsed.data.email);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        code: "RATE_LIMITED",
        error: "Слишком много попыток входа. Подождите 15 минут",
        message: "Слишком много попыток входа. Подождите 15 минут",
        retryAfterSeconds: rate.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  return NextResponse.json({ ok: true });
}
