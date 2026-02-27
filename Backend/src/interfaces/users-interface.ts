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
