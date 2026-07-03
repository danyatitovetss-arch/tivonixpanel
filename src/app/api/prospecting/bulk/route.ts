import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { prospectContactSchema } from "@/lib/validation/prospecting";
import { mapProspectInput } from "@/lib/db/mappers";

const bulkSchema = z.object({
  items: z.array(prospectContactSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const rows = parsed.data.items.map((item) => ({
    ...mapProspectInput(item as Record<string, unknown>),
    partner_id: auth.user.profileId,
    created_by: auth.user.profileId,
  }));

  const { data, error } = await supabase.from("prospect_contacts").insert(rows).select();
  if (error) return apiErrorResponse(error.message, 500);

  await supabase.rpc("write_audit_log", {
    p_action: "prospect_bulk_created",
    p_entity_type: "prospect_contact",
    p_entity_id: null,
  });

  return NextResponse.json({ data }, { status: 201 });
}
