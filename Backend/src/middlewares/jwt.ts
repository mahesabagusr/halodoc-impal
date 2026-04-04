import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import * as wrapper from "@/helpers/utils/wrapper";
import Unauthorized from "@/helpers/error/unautorizedError";
import { ERROR as httpError } from "@/helpers/http-status/statusCode";
import { config } from "@/helpers/infra/global-config";
import { TokenData, TokenResponse } from "@/interfaces/jwt-interface";

const jwtSecret = config.key.jwtSecret || config.key.privateKey || "dev-secret";
const jwtRefreshSecret = config.key.jwtSecret
  ? config.key.jwtSecret + "-refresh"
  : "dev-refresh-secret";

export const createToken = (data: TokenData): TokenResponse => {
  const accessToken: string = jwt.sign(
    {
      userId: data.userId,
      email: data.email,
      role: data.role,
    },
    jwtSecret,
    { expiresIn: "15m" }, // short-lived access token
  );

  const refreshToken: string = jwt.sign(
    {
      userId: data.userId,
      email: data.email,
      role: data.role,
    },
    jwtRefreshSecret,
    { expiresIn: "7d" }, // long-lived refresh token
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, jwtRefreshSecret);
};

export const decodeToken = (token: string): JwtPayload | string => {
  const data: string = token.split(" ")[1];
  const decode: string | JwtPayload = jwt.verify(data, jwtSecret);
  return decode;
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(" ")[1];

    if (token == null) {
      const error = wrapper.error(new Unauthorized("Invalid Token"));
      return wrapper.response(
        res,
        "fail",
        error,
        "Token Verification Failed",
        httpError.UNAUTHORIZED,
      );
    }

    jwt.verify(token, jwtSecret, (err: VerifyErrors | null, decoded) => {
      if (err) {
        const error = wrapper.error(new Unauthorized("Invalid Token" + err));
        return wrapper.response(
          res,
          "fail",
          error,
          "Token Verification Failed",
          httpError.NOT_FOUND,
        );
      }

      const payload = decoded as JwtPayload & {
        userId: number;
        email: string;
        role: "PATIENT" | "DOCTOR" | "ADMIN";
      };

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      console.log("Decoded Token Payload:", req.user);
      next();
    });
  } catch (err) {
    const error = wrapper.error(new Unauthorized("Invalid Token" + err));
    return wrapper.response(
      res,
      "fail",
      error,
      "Token Verification Failed",
      httpError.NOT_FOUND,
    );
  }
};
