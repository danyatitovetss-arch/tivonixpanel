import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { requireApiRole } from "@/lib/auth/require-api-user";

type ActorProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type AuditLogRow = {
  id: string;
  actor_profile_id: string | null;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  old_value: unknown;
  new_value: unknown;
  actor: ActorProfile | ActorProfile[] | null;
};

function normalizeActor(actor: ActorProfile | ActorProfile[] | null): ActorProfile | null {
  if (!actor) return null;
  return Array.isArray(actor) ? actor[0] ?? null : actor;
}

export async function GET(request: Request) {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const entityType = searchParams.get("entity_type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select(
      `
      id,
      actor_profile_id,
      actor_user_id,
      action,
      entity_type,
      entity_id,
      created_at,
      old_value,
      new_value,
      actor:profiles!actor_profile_id (
        id,
        full_name,
        email,
        role
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (action) query = query.eq("action", action);
  if (entityType) query = query.eq("entity_type", entityType);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) return apiErrorResponse(error.message, 500);

  const rows = ((data ?? []) as AuditLogRow[]).map((row) => ({
    ...row,
    actor: normalizeActor(row.actor),
  }));

  return NextResponse.json({ data: rows });
}
