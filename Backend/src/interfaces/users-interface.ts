import {
  AdminProfile,
  DoctorProfile,
  PatientProfile,
} from "@prisma/client";
import UsersRepository from "@/modules/Users/repositories/users-repositories";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephoneNumber: string;
  dob: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  specializationId?: number;
  strNumber?: string;
}

export interface ValidationResult<T> {
  err?: Error | null;
  data?: T | null;
}

export interface JwtToken {
  token: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface RegisteredUser {
  id: number;
  email: string;
  telephoneNumber?: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface UserListItem {
  id: number;
  fullName: string;
  email: string;
  telephoneNumber?: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: Date;
  patientProfile?: PatientProfile | null;
  doctorProfile?: DoctorProfile | null;
  adminProfile?: AdminProfile | null;
}

export type RoleProfile = Awaited<ReturnType<typeof UsersRepository.findById>>;

export type AddressList = Awaited<
  ReturnType<typeof UsersRepository.getAddresses>
>;

export type CreatedAddress = Awaited<
  ReturnType<typeof UsersRepository.addAddress>
>;

export type UpdatedAdminStatus = Awaited<
  ReturnType<typeof UsersRepository.updateAdminStatus>
>;
