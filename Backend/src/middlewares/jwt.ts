import { Request, Response, NextFunction } from "express";
import fs from "fs";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import * as wrapper from "@/helpers/utils/wrapper";
import Unauthorized from "@/helpers/error/unautorizedError";
import { ERROR as httpError } from "@/helpers/http-status/statusCode";
import { config } from "@/helpers/infra/global-config";
import { TokenData, TokenResponse } from "@/interfaces/jwt-interface";

const getKey = (keyPath: string) => fs.readFileSync(keyPath, "utf8");
const privateKey = getKey(config.key.privateKey!);

export const createToken = (data: TokenData): TokenResponse => {
  const accessToken: string = jwt.sign(
    {
      username: data.username,
      email: data.email,
      signature: data.signature,
    },
    privateKey as string,
    { algorithm: "RS256", expiresIn: "1d" }
  );

  return { accessToken };
};

export const decodeToken = (token: string): JwtPayload | string => {
  const data: string = token.split(" ")[1];
  const decode: string | JwtPayload = jwt.verify(data, privateKey);
  return decode;
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
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
        httpError.UNAUTHORIZED
      );
    }

    jwt.verify(token, privateKey, (err: VerifyErrors | null) => {
      if (err) {
        const error = wrapper.error(new Unauthorized("Invalid Token" + err));
        return wrapper.response(
          res,
          "fail",
          error,
          "Token Verification Failed",
          httpError.NOT_FOUND
        );
      }

      next();
    });
  } catch (err) {
    const error = wrapper.error(new Unauthorized("Invalid Token" + err));
    return wrapper.response(
      res,
      "fail",
      error,
      "Token Verification Failed",
      httpError.NOT_FOUND
    );
  }
};
