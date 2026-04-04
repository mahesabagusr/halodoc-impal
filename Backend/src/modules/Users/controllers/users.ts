import * as wrapper from "@/helpers/utils/wrapper";
import {
  ERROR as httpError,
  SUCCESS as http,
} from "@/helpers/http-status/statusCode";
import logger from "@/helpers/utils/winston";
import { Request, Response } from "express";
import { isValidPayload } from "@/helpers/utils/validator";
import {
  LoginUserSchema,
  RegisterUserSchema,
  RefreshTokenSchema,
} from "@/schemas/user-schema";
import UserService from "@/modules/Users/services/users";
import {
  RegisterUserDto,
  LoginUserDto,
  RefreshTokenDto,
} from "@/dtos/user-dto";

export const userRegister =
  (roleToAssign: "PATIENT" | "DOCTOR" | "ADMIN" = "PATIENT") =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: RegisterUserDto = { ...req.body };

      const validatePayload = await isValidPayload(payload, RegisterUserSchema);

      if (validatePayload.err) {
        return wrapper.response(
          res,
          "fail",
          { err: validatePayload.err, data: null },
          "Invalid Payload",
          httpError.BAD_REQUEST,
        );
      }

      const result = await UserService.createUserByRole(payload, roleToAssign);

      if (result.err) {
        return wrapper.response(
          res,
          "fail",
          result,
          "User Registration Failed",
          httpError.BAD_REQUEST,
        );
      }

      return wrapper.response(
        res,
        "success",
        result,
        "User Registration Successful",
        http.CREATED,
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      const error = err instanceof Error ? err : new Error(errorMessage);
      logger.error(
        `Unexpected error during user registration: ${errorMessage}`,
      );

      return wrapper.response(
        res,
        "fail",
        { err: error, data: null },
        "Registration Failed",
        httpError.INTERNAL_ERROR,
      );
    }
  };

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: LoginUserDto = { ...req.body };

    const validatePayload = await isValidPayload(payload, LoginUserSchema);

    if (validatePayload.err) {
      return wrapper.response(
        res,
        "fail",
        { err: validatePayload.err, data: null },
        "Invalid Payload",
        httpError.BAD_REQUEST,
      );
    }

    const result = await UserService.login(payload);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Login Failed",
        httpError.UNAUTHORIZED,
      );
    }

    return wrapper.response(
      res,
      "success",
      result,
      "Login Successful",
      http.OK,
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const error = err instanceof Error ? err : new Error(errorMessage);
    logger.error(`Unexpected error during user login: ${errorMessage}`);

    return wrapper.response(
      res,
      "fail",
      { err: error, data: null },
      "Login Failed",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const userEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    return wrapper.response(
      res,
      "fail",
      { err: new Error("Edit user not implemented yet"), data: null },
      "Feature Not Implemented",
      httpError.SERVICE_UNAVAILABLE,
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const error = err instanceof Error ? err : new Error(errorMessage);
    logger.error(`Unexpected error during user edit: ${errorMessage}`);

    return wrapper.response(
      res,
      "fail",
      { err: error, data: null },
      "Update Failed",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await UserService.getAllUsers();

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to fetch users",
        httpError.BAD_REQUEST,
      );
    }

    return wrapper.response(res, "success", result, "Users fetched", http.OK);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const error = err instanceof Error ? err : new Error(errorMessage);
    logger.error(`Unexpected error during users fetch: ${errorMessage}`);

    return wrapper.response(
      res,
      "fail",
      { err: error, data: null },
      "Fetch users failed",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const payload: RefreshTokenDto = { ...req.body };

    const validatePayload = await isValidPayload(payload, RefreshTokenSchema);

    if (validatePayload.err) {
      return wrapper.response(
        res,
        "fail",
        { err: validatePayload.err, data: null },
        "Invalid Payload",
        httpError.BAD_REQUEST,
      );
    }

    const result = await UserService.refreshToken(payload);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Refresh Token Failed",
        httpError.UNAUTHORIZED,
      );
    }

    return wrapper.response(res, "success", result, "Token Refreshed", http.OK);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred";
    const error = err instanceof Error ? err : new Error(errorMessage);
    logger.error(`Unexpected error during refresh token: ${errorMessage}`);

    return wrapper.response(
      res,
      "fail",
      { err: error, data: null },
      "Refresh Token Failed",
      httpError.INTERNAL_ERROR,
    );
  }
};
