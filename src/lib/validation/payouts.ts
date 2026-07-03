import { z } from "zod";

export const payoutCreateSchema = z.object({
  partnerId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().max(8).default("USD"),
  paymentMethod: z.string().max(64).optional().nullable(),
  paymentDetails: z.string().max(500).optional().nullable(),
  adminComment: z.string().max(2000).optional().nullable(),
});

export type PayoutCreateInput = z.infer<typeof payoutCreateSchema>;
