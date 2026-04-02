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
} from "@/interfaces/users-interface";
import { createToken } from "@/middlewares/jwt";
import UsersRepository from "@/modules/Users/repositories/users";
import { Role } from "@prisma/client";

export default class UserService {
  static async createUserByRole(
    payload: RegisterUserDto,
    role: Role,
  ): Promise<ResponseResult<RegisteredUser>> {
    const { fullName, email, password } = payload;

    logger.info(`Creating Account: ${email}`);

    const existingUser = await UsersRepository.findByEmail(email);

    if (existingUser) {
      return wrapper.error(new UnauthorizedError("Email Already Exists"));
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    const createUser = await UsersRepository.createUser({
      fullName,
      email,
      password: hashPassword,
      role,
    });

    if (!createUser) {
      logger.error(`Failed to create user with email ${email}`);
      return wrapper.error(new BadRequestError("Failed to create user"));
    }

    return wrapper.data(createUser);
  }

  static async register(
    payload: RegisterUserDto,
  ): Promise<ResponseResult<RegisteredUser>> {
    try {
      if (payload.role && payload.role !== "PATIENT") {
        return wrapper.error(
          new UnauthorizedError(
            "Only PATIENT self-registration is allowed. ADMIN is required to create doctor/admin accounts",
          ),
        );
      }

      return await UserService.createUserByRole(payload, "PATIENT");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async registerDoctor(
    payload: RegisterUserDto,
  ): Promise<ResponseResult<RegisteredUser>> {
    try {
      return await UserService.createUserByRole(payload, "DOCTOR");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async registerAdmin(
    payload: RegisterUserDto,
  ): Promise<ResponseResult<RegisteredUser>> {
    try {
      return await UserService.createUserByRole(payload, "ADMIN");
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
        return wrapper.error(new NotFoundError("User not found"));
      }

      if (!user.password) {
        return wrapper.error(new UnauthorizedError("Invalid credentials"));
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return wrapper.error(new UnauthorizedError("Incorrect password"));
      }

      const { accessToken } = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      return wrapper.data({ token: accessToken });
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

  static async editUser() {}
}
