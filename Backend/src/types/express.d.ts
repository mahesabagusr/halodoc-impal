import { AuthenticatedUser } from "@/interfaces/users-interface";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
