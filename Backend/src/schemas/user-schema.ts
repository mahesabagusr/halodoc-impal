import { z } from "zod";

export const RegisterUserSchema = z.object({
  fullName: z.string().min(3, "Full name minimal 3 karakter"),
  email: z.string().email("email tidak valid"),
  password: z.string().min(8, "Password minimal 8 Karakter"),
  role: z.enum(["PATIENT", "DOCTOR", "ADMIN"]).optional(),
  dob: z.string().datetime().optional(), 
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  specialization: z.string().optional(),
  strNumber: z.string().optional(),
  department: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email("Email Tidak Valid"),
  password: z.string().min(8, "Password minimal 8 Karakter"),
});

export const EditUserSchema = z.object({
  fullName: z.string().min(3, "Nama Lengkap minimal 3 Karakter").optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  specialization: z.string().optional(),
  strNumber: z.string().optional(),
  department: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
