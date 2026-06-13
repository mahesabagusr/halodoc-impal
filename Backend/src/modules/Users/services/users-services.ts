import * as wrapper from "@/helpers/utils/wrapper";
import { NotFoundError, UnauthorizedError } from "@/helpers/error";
import bcrypt from "bcrypt";
import { BadRequestError } from "@/helpers/error";
import logger from "@/helpers/utils/winston";
import { LoginUserDto, RegisterUserDto } from "@/dtos/user-dto";
import { ResponseResult } from "@/interfaces/wrapper-interface";
import {
  JwtToken,
  RegisteredUser,
  UserListItem,
  RoleProfile,
  AddressList,
  CreatedAddress,
  UpdatedAdminStatus,
} from "@/interfaces/users-interface";
import { createToken, verifyRefreshToken } from "@/middlewares/jwt";
import UsersRepository from "@/modules/Users/repositories/users-repositories";
import { Role } from "@prisma/client";

export default class UserService {
  static async createUserByRole(
    payload: RegisterUserDto,
    role: Role = "PATIENT",
  ): Promise<ResponseResult<RegisteredUser>> {
    try {
      const { fullName, email, password, telephoneNumber } = payload;

      logger.info(`Creating Account: ${email} as ${role}`);

      const existingUser = await UsersRepository.findByEmail(email);

      if (existingUser) {
        return wrapper.error(new UnauthorizedError("Email Sudah Digunakan"));
      }

      const existingPhoneNumber =
        await UsersRepository.findPhoneNumnber(telephoneNumber);

      if (existingPhoneNumber) {
        return wrapper.error(
          new UnauthorizedError("Nomor Telepon Sudah Digunakan"),
        );
      }

      const hashPassword: string = await bcrypt.hash(password, 10);

      const createUser = await UsersRepository.createUser({
        fullName,
        email,
        password: hashPassword,
        telephoneNumber,
        role: role as Role,
        dob: payload.dob,
        gender: payload.gender,
        specializationId: payload.specializationId,
        strNumber: payload.strNumber,
      });

      if (!createUser) {
        logger.error(`Failed to create user with email ${email}`);
        return wrapper.error(new BadRequestError("Failed to create user"));
      }

      return wrapper.data(createUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async login(payload: LoginUserDto): Promise<ResponseResult<JwtToken>> {
    try {
      const { password, email } = payload;

      const user = await UsersRepository.findByEmail(email);

      if (!user) {
        return wrapper.error(new NotFoundError("email tidak ditemukan"));
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return wrapper.error(new UnauthorizedError("Password Salah"));
      }

      const { accessToken, refreshToken } = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      return wrapper.data({
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          telephoneNumber: user.telephoneNumber,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async getAllUsers(): Promise<ResponseResult<UserListItem[]>> {
    try {
      const users = await UsersRepository.findAllUsers();

      return wrapper.data(users);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async getRoleProfile(
    userId: number,
  ): Promise<ResponseResult<RoleProfile>> {
    try {
      const user = await UsersRepository.findById(userId);
      if (!user) return wrapper.error(new NotFoundError("User not found"));
      return wrapper.data(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async updatePassword(
    userId: number,
    payload: any,
  ): Promise<ResponseResult<{ message: string }>> {
    try {
      const existingUser = await UsersRepository.findById(userId);
      if (!existingUser)
        return wrapper.error(new NotFoundError("User not found"));

      const isValid = await bcrypt.compare(
        payload.oldPassword,
        existingUser.password,
      );
      if (!isValid)
        return wrapper.error(new UnauthorizedError("Incorrect old password"));

      const hashPassword = await bcrypt.hash(payload.newPassword, 10);
      await UsersRepository.updatePassword(userId, hashPassword);

      return wrapper.data({ message: "Password updated successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async updateProfile(
    userId: number,
    payload: any,
  ): Promise<ResponseResult<RoleProfile>> {
    try {
      const existingUser = await UsersRepository.findById(userId);
      if (!existingUser)
        return wrapper.error(new NotFoundError("User not found"));

      await UsersRepository.updateUserProfile(userId, {
        fullName: payload.fullName,
        telephoneNumber: payload.telephoneNumber,
      });

      if (existingUser.role === "PATIENT" && (payload.dob || payload.gender)) {
        await UsersRepository.updatePatientDemographics(
          userId,
          payload.dob ? new Date(payload.dob) : undefined,
          payload.gender,
        );
      }

      const updatedUser = await UsersRepository.findById(userId);
      return wrapper.data(updatedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async addAddress(
    userId: number,
    payload: any,
  ): Promise<ResponseResult<CreatedAddress>> {
    try {
      const user = await UsersRepository.findById(userId);
      if (!user || !user.patientProfile)
        return wrapper.error(new NotFoundError("Patient profile not found"));

      if (payload.isDefault) {
        await UsersRepository.clearDefaultAddress(user.patientProfile.id);
      }

      const address = await UsersRepository.addAddress({
        patientProfileId: user.patientProfile.id,
        ...payload,
      });

      return wrapper.data(address);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async getAddresses(
    userId: number,
  ): Promise<ResponseResult<AddressList>> {
    try {
      const user = await UsersRepository.findById(userId);
      if (!user || !user.patientProfile)
        return wrapper.error(new NotFoundError("Patient profile not found"));

      const addresses = await UsersRepository.getAddresses(
        user.patientProfile.id,
      );
      return wrapper.data(addresses);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async updateAdminStatus(
    adminProfileId: number,
    isSuperAdmin: boolean,
  ): Promise<ResponseResult<UpdatedAdminStatus>> {
    try {
      const updated = await UsersRepository.updateAdminStatus(
        adminProfileId,
        isSuperAdmin,
      );
      return wrapper.data(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async refreshToken(payload: {
    refreshToken: string;
  }): Promise<ResponseResult<JwtToken>> {
    try {
      const { refreshToken } = payload;
      const decoded: any = verifyRefreshToken(refreshToken);

      if (!decoded || !decoded.userId) {
        return wrapper.error(new UnauthorizedError("Invalid refresh token"));
      }

      const user = await UsersRepository.findByEmail(decoded.email);

      if (!user) {
        return wrapper.error(new NotFoundError("User not found"));
      }

      const { accessToken, refreshToken: newRefreshToken } = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return wrapper.data({
        token: accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(
        new UnauthorizedError("Token refresh failed: " + message),
      );
    }
  }
}
