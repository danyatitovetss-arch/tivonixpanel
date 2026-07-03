import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { setPasswordSchema } from "@/lib/validation/users";
import { toUserMessage } from "@/lib/errors";

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });
  }

  if (!current.onboardingComplete || !current.crmAccess) {
    return NextResponse.json({ error: "Сначала завершите оформление" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = setPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
    data: { must_change_password: false },
  });

  if (error) {
    return NextResponse.json({ error: toUserMessage(error.message) }, { status: 400 });
  }

  await supabase.rpc("write_audit_log", {
    p_action: "password_changed",
    p_entity_type: "user",
    p_entity_id: current.authId,
  });

  return NextResponse.json({ success: true });
}
