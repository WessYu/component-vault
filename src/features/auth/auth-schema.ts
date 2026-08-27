import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254)),
  password: z.string().min(1, "Enter your password.").max(128, "Password is too long."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name must have at least 2 characters.").max(80, "Name is too long."),
  password: z.string().min(10, "Password must have at least 10 characters.").max(128, "Password is too long."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
