import { z } from "zod";

export const adminCreateUserSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  telegram: z.string().max(64).optional().nullable(),
  role: z.enum(["partner", "manager"]).default("partner"),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Минимум 8 символов").max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
