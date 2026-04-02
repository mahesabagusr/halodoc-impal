export interface TokenData {
  userId: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface TokenResponse {
  accessToken: string;
}
