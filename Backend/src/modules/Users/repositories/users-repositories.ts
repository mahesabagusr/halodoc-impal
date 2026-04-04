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
    dob?: string | Date;
    gender?: "MALE" | "FEMALE" | "OTHER";
    specializationId?: number;
    strNumber?: string;
  }): Promise<RegisteredUser> {
    return prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        ...(payload.role === "PATIENT" && {
          patientProfile: {
            create: {
              dob: payload.dob ? new Date(payload.dob) : undefined,
              gender: payload.gender,
            },
          },
        }),
        ...(payload.role === "ADMIN" && {
          adminProfile: {
            create: {},
          },
        }),
        ...(payload.role === "DOCTOR" &&
          payload.specializationId &&
          payload.strNumber && {
            doctorProfile: {
              create: {
                specialization: {
                  connect: { id: payload.specializationId },
                },
                strNumber: payload.strNumber,
              },
            },
          }),
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
        patientProfile: true,
        doctorProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
