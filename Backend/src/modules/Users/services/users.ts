import * as wrapper from "@/helpers/utils/wrapper";
import prisma from "@/helpers/db/prisma/client";
import { NotFoundError, UnauthorizedError } from "@/helpers/error";
import bcrypt from "bcrypt";
import { BadRequestError } from "@/helpers/error";
import logger from "@/helpers/utils/winston";
import { LoginUserDto, RegisterUserDto } from "@/dtos/user-dto";
import { ResponseResult } from "@/interfaces/wrapper-interface";
import { JwtToken } from "@/interfaces/users-interface";
import { createToken } from "@/middlewares/jwt";

export default class UserService {
  static async register(
    payload: RegisterUserDto,
  ): Promise<ResponseResult<{ id: number; email: string; role: string }>> {
    try {
      const { fullName, email, password } = payload;

      logger.info(`Creating Account: ${email}`);

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (existingUser) {
        return wrapper.error(new UnauthorizedError("Email Already Exists"));
      }

      const hashPassword: string = await bcrypt.hash(password, 10);

      const createUser = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashPassword,
          role: "PATIENT",
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
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

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

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

  static async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return wrapper.data(users);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async editUser() {}
}
