import prisma from "@/helpers/db/prisma/client";
import { Role } from "@/generated/prisma";
import { RegisteredUser, UserListItem } from "@/interfaces/users-interface";

export default class UsersRepository {
  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  static async createUser(payload: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
  }): Promise<RegisteredUser> {
    return prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  static async findAllUsers(): Promise<UserListItem[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
