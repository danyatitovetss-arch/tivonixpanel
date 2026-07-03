import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApiCrmAccess } from "@/lib/auth/require-api-user";
import { findDuplicateLeadGlobal } from "@/lib/api/find-duplicate-lead";

const schema = z.object({
  businessName: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  excludeProspectId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireApiCrmAccess();
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const input = parsed.data;

  let leadDup: unknown[] = [];
  try {
    leadDup = await findDuplicateLeadGlobal({
      businessName: input.businessName,
      website: input.website,
      instagram: input.instagram,
      telegram: input.telegram,
      phone: input.phone,
      email: input.email || null,
    });
  } catch {
    /* admin client unavailable — skip global lead duplicate */
  }

  if (leadDup.length > 0) {
    const match = leadDup[0] as Record<string, unknown>;
    return NextResponse.json({ duplicate: { type: "lead", ...match } });
  }

  let query = supabase
    .from("prospect_contacts")
    .select("id, business_name, status, created_at, partner_id")
    .limit(5);

  if (input.businessName) query = query.ilike("business_name", input.businessName);
  if (input.excludeProspectId) query = query.neq("id", input.excludeProspectId);

  const { data: prospects } = await query;
  const match = prospects?.[0];
  if (match) {
    return NextResponse.json({
      duplicate: { type: "prospect", id: match.id, businessName: match.business_name, status: match.status },
    });
  }

  return NextResponse.json({ duplicate: null });
}
