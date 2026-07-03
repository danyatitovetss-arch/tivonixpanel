import { NextResponse } from "next/server";
import { getCurrentUser } from "./get-current-user";
import type { UserRole } from "@/lib/types";

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 }) };
  }
  if (user.status === "blocked" || user.blockedUnder16) {
    return { user: null, response: NextResponse.json({ error: "Доступ заблокирован" }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function requireApiCrmAccess() {
  const result = await requireApiUser();
  if (result.response) return result;
  const { user } = result;
  if (!user!.crmAccess || !user!.onboardingComplete || user!.requiresReaccept) {
    return {
      user: null,
      response: NextResponse.json({ error: "Завершите юридическое оформление" }, { status: 403 }),
    };
  }
  return { user: user!, response: null };
}

export async function requireApiRole(...roles: UserRole[]) {
  const result = await requireApiUser();
  if (result.response) return result;
  if (!roles.includes(result.user!.role)) {
    return { user: null, response: NextResponse.json({ error: "Недостаточно прав" }, { status: 403 }) };
  }
  return { user: result.user!, response: null };
}
