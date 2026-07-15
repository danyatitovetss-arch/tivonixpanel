import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { leadCreateSchema } from "@/lib/validation/leads";
import {
  assertPartnerLeadStatus,
  canManageLeadWorkflow,
} from "@/lib/api/permissions";
import { createDealForLeadIfMissing } from "@/lib/api/create-deal-for-lead";
import { syncAdminReviewForStatus } from "@/lib/lead-admin-workflow";
import type { AdminReviewStatus, LeadStatus } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

const leadUpdateSchema = leadCreateSchema.partial().extend({
  status: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  nextAction: z.string().max(500).optional().nullable(),
  assignedManagerId: z.string().uuid().nullable().optional(),
});

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const parsed = leadUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const patch: Record<string, unknown> = {};
  if (input.businessName) patch.business_name = input.businessName;
  if (input.niche !== undefined) patch.niche = input.niche;
  if (input.city !== undefined) patch.city = input.city;
  if (input.contactName !== undefined) patch.contact_name = input.contactName;
  if (input.instagramUrl !== undefined) patch.instagram_url = input.instagramUrl;
  if (input.telegramUsername !== undefined) patch.telegram_username = input.telegramUsername;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.email !== undefined) patch.email = input.email || null;
  if (input.website !== undefined) patch.website = input.website;
  if (input.source !== undefined) patch.source = input.source;
  if (input.serviceType !== undefined) patch.service_type = input.serviceType;
  if (input.estimatedBudget !== undefined) patch.estimated_budget = input.estimatedBudget;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.nextAction !== undefined) patch.next_action = input.nextAction;
  if (input.priority) patch.priority = input.priority;

  if (input.status) {
    if (!canManageLeadWorkflow(auth.user.role) && !assertPartnerLeadStatus(input.status)) {
      return NextResponse.json(
        { error: "Партнёр не может менять этот статус клиента" },
        { status: 403 }
      );
    }
    patch.status = input.status;
  }

  if (input.assignedManagerId !== undefined) {
    if (!canManageLeadWorkflow(auth.user.role)) {
      return NextResponse.json({ error: "Недостаточно прав для назначения менеджера" }, { status: 403 });
    }
    patch.assigned_manager_id = input.assignedManagerId;
  }

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("leads")
    .select("id, admin_review_status")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }

  if (input.status) {
    const reviewSync = syncAdminReviewForStatus(
      input.status as LeadStatus,
      (existing.admin_review_status ?? "pending") as AdminReviewStatus
    );
    if (reviewSync) patch.admin_review_status = reviewSync;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().maybeSingle();
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "PGRST116" || code === "42501") {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }
    return apiErrorResponse(error.message, 500);
  }
  if (!data) {
    return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
  }

  await supabase.from("lead_activities").insert({
    lead_id: id,
    user_id: auth.user.profileId,
    action_type: "lead_updated",
    comment: "Обновление лида",
  });

  if (data.status === "won") {
    await createDealForLeadIfMissing(supabase, data, auth.user.profileId);
  }

  return NextResponse.json({ data });
}
