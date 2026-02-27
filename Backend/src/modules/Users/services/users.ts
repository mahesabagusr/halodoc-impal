import * as wrapper from "@/helpers/utils/wrapper";
import prisma from "@/helpers/db/prisma/client";
import { NotFoundError, UnauthorizedError } from "@/helpers/error";
import { nanoid } from "nanoid";
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
  ): Promise<ResponseResult<string>> {
    try {
      const { username, email, password } = payload;

      logger.info(`Creating Account: ${username}`);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        const message =
          existingUser.email === email
            ? "Email Already Exists"
            : "Username Already Exists";
        return wrapper.error(new UnauthorizedError(message));
      }

      const signature: string = nanoid(4);

      const hashPassword: string = await bcrypt.hash(password, 10);

      const createUser = await prisma.user.create({
        data: {
          username,
          fullname: username,
          email,
          password: hashPassword,
          signature: signature,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (!createUser) {
        logger.error(`Failed to create user with email ${email}`);
        return wrapper.error(new BadRequestError("Failed to create user"));
      }

      return wrapper.data("Register Successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async login(payload: LoginUserDto): Promise<ResponseResult<JwtToken>> {
    try {
      const { password, identifier } = payload;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: identifier }, { email: identifier }],
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
        username: user.username,
        email: user.email,
        signature: user.signature ?? undefined,
      });
      return wrapper.data({ token: accessToken });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async editUser() {}
}
