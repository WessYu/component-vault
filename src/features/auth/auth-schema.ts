import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must have at least 6 characters."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must have at least 2 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
