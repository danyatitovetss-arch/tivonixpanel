import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/require-api-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { adminCreateUserSchema } from "@/lib/validation/users";
import { toUserMessage } from "@/lib/errors";

export async function GET() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, telegram, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return apiErrorResponse(error.message, 500);

  const userIds = (profiles ?? []).map((p) => p.user_id);
  const { data: legalRows } = userIds.length
    ? await supabase
        .from("user_legal_profiles")
        .select("user_id, onboarding_status, crm_access, payout_status")
        .in("user_id", userIds)
    : { data: [] };

  const legalByUser = new Map((legalRows ?? []).map((row) => [row.user_id, row]));

  const data = (profiles ?? []).map((profile) => {
    const legal = legalByUser.get(profile.user_id);
    return {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name,
      email: profile.email,
      telegram: profile.telegram,
      role: profile.role,
      status: profile.status,
      onboardingStatus: legal?.onboarding_status ?? "not_started",
      crmAccess: legal?.crm_access ?? false,
      payoutStatus: legal?.payout_status ?? null,
      createdAt: profile.created_at,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;

  const body = await request.json();
  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, email, password, telegram, role } = parsed.data;
  const admin = createAdminClient();

  const { data: listed, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) return apiErrorResponse(listErr.message, 500);

  const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      must_change_password: true,
    },
  });

  if (createErr || !created.user) {
    return apiErrorResponse(toUserMessage(createErr?.message ?? "Не удалось создать пользователя"), 500);
  }

  const userId = created.user.id;
  await new Promise((r) => setTimeout(r, 400));

  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      telegram: telegram?.trim() || null,
      role,
      status: "active",
      partner_type: role === "partner" ? "referral" : null,
    })
    .eq("user_id", userId);

  if (profileErr) return apiErrorResponse(profileErr.message, 500);

  const supabase = await createClient();
  await supabase.rpc("write_audit_log", {
    p_action: "admin_user_created",
    p_entity_type: "profile",
    p_entity_id: userId,
    p_new_value: { email, role },
  });

  return NextResponse.json({
    data: {
      userId,
      fullName,
      email,
      role,
      temporaryPassword: password,
    },
  });
}
