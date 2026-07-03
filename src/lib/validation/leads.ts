import { z } from "zod";

export const leadCreateSchema = z.object({
  businessName: z.string().min(1).max(200),
  niche: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  instagramUrl: z.string().max(255).optional().nullable(),
  telegramUsername: z.string().max(120).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  website: z.string().max(500).optional().nullable(),
  source: z.string().max(64).optional().nullable(),
  serviceType: z
    .enum([
      "landing",
      "website",
      "telegram_bot",
      "crm",
      "ai_automation",
      "design",
      "project_rework",
      "other",
    ])
    .optional()
    .nullable(),
  estimatedBudget: z.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  nextAction: z.string().max(500).optional().nullable(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
