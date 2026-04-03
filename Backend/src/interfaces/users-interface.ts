export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  signature?: string;
}

export interface ValidationResult<T> {
  err?: Error | null;
  data?: T | null;
}

export interface JwtToken {
  token: string;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface RegisteredUser {
  id: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface UserListItem {
  id: number;
  fullName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: Date;
  patientProfile?: any;
  doctorProfile?: any;
  adminProfile?: any;
}
