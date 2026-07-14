import { z } from "zod";

export const partnerTypeSchema = z.enum(["referral", "white_label"]);

export const partnerRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Укажите имя и фамилию")
      .max(120, "Слишком длинное имя"),
    agencyName: z.string().trim().max(160, "Слишком длинное название").optional().nullable(),
    telegram: z
      .string()
      .trim()
      .min(2, "Укажите Telegram")
      .max(64, "Слишком длинный Telegram")
      .regex(/^@?[A-Za-z0-9_]{4,}$|^https?:\/\/t\.me\/[A-Za-z0-9_]{4,}/i, "Некорректный Telegram"),
    email: z
      .string()
      .trim()
      .email("Некорректный email")
      .max(255)
      .transform((v) => v.toLowerCase()),
    websiteUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .nullable()
      .transform((v) => (v && v.length > 0 ? v : null))
      .refine((v) => v === null || /^https?:\/\//i.test(v) || /^[\w.-]+\.[\w.-]+/.test(v), {
        message: "Укажите корректную ссылку",
      }),
    password: z
      .string()
      .min(8, "Пароль — минимум 8 символов")
      .max(128, "Пароль слишком длинный"),
    confirmPassword: z.string().min(8, "Повторите пароль").max(128),
    partnerType: partnerTypeSchema,
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Необходимо принять условия и политику конфиденциальности",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type PartnerRegisterInput = z.infer<typeof partnerRegisterSchema>;

export const adminPartnerApplicationUpdateSchema = z.object({
  status: z.enum(["pending", "active", "rejected", "suspended", "inactive", "blocked"]).optional(),
  partnerType: partnerTypeSchema.optional().nullable(),
  commissionPercentOverride: z.number().min(0).max(100).nullable().optional(),
  assignedManagerId: z.string().uuid().nullable().optional(),
  partnershipNotes: z.string().max(2000).nullable().optional(),
  rejectionReason: z.string().max(1000).nullable().optional(),
});

export type AdminPartnerApplicationUpdateInput = z.infer<typeof adminPartnerApplicationUpdateSchema>;
