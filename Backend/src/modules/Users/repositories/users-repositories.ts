import prisma from "@/helpers/db/prisma/client";
import { Role } from "@prisma/client";
import { RegisteredUser, UserListItem } from "@/interfaces/users-interface";

export default class UsersRepository {
  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  static async findPhoneNumnber(telephoneNumber: string) {
    return prisma.user.findFirst({
      where: {
        telephoneNumber,
      },
    });
  }

  static async createUser(payload: {
    fullName: string;
    email: string;
    password: string;
    telephoneNumber: string;
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
        telephoneNumber: payload.telephoneNumber,
        role: payload.role,
        ...(payload.role === "PATIENT" && {
          patientProfile: {
            create: {
              dob: payload.dob ? new Date(payload.dob) : new Date(),
              gender: payload.gender,
            },
          },
        }),
        ...(payload.role === "ADMIN" && {
          adminProfile: {
            create: {},
          },
        }),
        ...(payload.role === "DOCTOR" && {
          doctorProfile: {
            create: {
              specialization: {
                connect: { id: payload.specializationId || 1 },
              },
              strNumber: `STR-${payload.specializationId || 1}-${Date.now()}`,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        telephoneNumber: true,
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
        telephoneNumber: true,
        role: true,
        createdAt: true,
        patientProfile: true,
        doctorProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: true,
        adminProfile: true,
        doctorProfile: {
          include: { specialization: true },
        },
      },
    });
  }

  static async updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });
  }

  static async updateUserProfile(
    id: number,
    payload: { fullName?: string; telephoneNumber?: string },
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        fullName: payload.fullName,
        telephoneNumber: payload.telephoneNumber,
      },
    });
  }

  static async getAddresses(patientProfileId: number) {
    return prisma.address.findMany({
      where: { patientProfileId },
    });
  }

  static async addAddress(payload: {
    patientProfileId: number;
    label?: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }) {
    return prisma.address.create({
      data: payload,
    });
  }

  static async updateAddress(
    id: number,
    payload: {
      label?: string;
      streetAddress?: string;
      city?: string;
      postalCode?: string;
      isDefault?: boolean;
    },
  ) {
    return prisma.address.update({
      where: { id },
      data: payload,
    });
  }

  static async deleteAddress(id: number) {
    return prisma.address.delete({
      where: { id },
    });
  }

  static async clearDefaultAddress(patientProfileId: number) {
    return prisma.address.updateMany({
      where: { patientProfileId, isDefault: true },
      data: { isDefault: false },
    });
  }

  static async updatePatientDemographics(
    patientId: number,
    dob?: Date,
    gender?: "MALE" | "FEMALE" | "OTHER",
  ) {
    return prisma.patientProfile.update({
      where: { userId: patientId },
      data: { dob, gender },
    });
  }

  static async updateAdminStatus(
    adminProfileId: number,
    isSuperAdmin: boolean,
  ) {
    return prisma.adminProfile.update({
      where: { id: adminProfileId },
      data: { isSuperAdmin },
    });
  }
}
