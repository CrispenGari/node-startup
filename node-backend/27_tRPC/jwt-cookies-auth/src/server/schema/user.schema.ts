import { string, z } from "zod";

export const registerSchema = z.object({
  username: string().min(3).max(100),
  password: z.string().min(3).max(100),
  email: z.string().email(),
});

export const loginSchema = z.object({
  password: string(),
  email: z.string().email(),
});

export const confirmSchema = z.object({
  code: string().min(3).max(100),
  id: string().optional(),
});

export type RegisterInput = z.TypeOf<typeof registerSchema>;
export type ConfirmInput = z.TypeOf<typeof confirmSchema>;
export type LoginInput = z.TypeOf<typeof loginSchema>;
