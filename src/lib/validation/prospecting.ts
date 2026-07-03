import { z } from "zod";

export const prospectContactSchema = z.object({
  businessName: z.string().min(1).max(200),
  niche: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  source: z.string().max(64).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  instagram: z.string().max(120).optional().nullable(),
  telegram: z.string().max(120).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  contactPerson: z.string().max(120).optional().nullable(),
  status: z.string().max(32).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  websiteQuality: z.enum(["no_website", "bad", "average", "good", "unknown"]).optional(),
  hasWebsite: z.boolean().nullable().optional(),
  hasOnlineBooking: z.boolean().optional(),
  hasTelegramBot: z.boolean().optional(),
  hasCrm: z.boolean().optional(),
  painPoints: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export type ProspectContactInput = z.infer<typeof prospectContactSchema>;
