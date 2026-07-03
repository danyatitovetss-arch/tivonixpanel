import { z } from "zod";

export const dealCreateSchema = z.object({
  leadId: z.string().uuid(),
  clientName: z.string().min(1).max(200),
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
  amount: z.number().positive(),
  currency: z.string().max(8).default("USD"),
  notes: z.string().max(2000).optional().nullable(),
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;
