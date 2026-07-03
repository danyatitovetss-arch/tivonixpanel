import { createAdminClient } from "@/lib/supabase/admin";

export async function findDuplicateLeadGlobal(input: {
  businessName?: string | null;
  website?: string | null;
  instagram?: string | null;
  telegram?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("find_duplicate_lead", {
    p_business_name: input.businessName ?? null,
    p_website: input.website ?? null,
    p_instagram: input.instagram ?? null,
    p_telegram: input.telegram ?? null,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
  });
  if (error) throw error;
  return data ?? [];
}
