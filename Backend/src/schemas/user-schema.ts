import { z } from "zod";

export const RegisterUserSchema = z.object({
  username: z.string().min(8, "Username minimal 8 Karakter"),
  email: z.string().email("email tidak valid"),
  password: z.string().min(8, "Password minimal 8 Karakter"),
  fullname: z.string().min(8, "FullName minimal 8 Karakter"),
  signature: z.string().optional(),
});

export const LoginUserSchema = z.object({
  identifier: z.union([z.string().email("Email Tidak Valid"), z.string()]),
  password: z.string().min(8, "Password minimal 8 Karakter"),
});

export const EditUserSchema = z.object({
  username : z.string().min(8, "Username minimal 8 Karakter").optional(),
  fullname : z.string().min(8, "Nama Lengkap minimal 8 Karakter").optional(),
});
