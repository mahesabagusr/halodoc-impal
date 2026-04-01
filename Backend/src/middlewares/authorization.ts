import { Request, Response, NextFunction } from "express";
import * as wrapper from "@/helpers/utils/wrapper";
import { ForbiddenError } from "@/helpers/error";

export const authorize = (roles: Array<"PATIENT" | "DOCTOR" | "ADMIN">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return wrapper.response(
        res,
        "fail",
        wrapper.error(
          new ForbiddenError("You are not authorized to perform this action"),
        ),
        "Forbidden",
        403,
      );
    }

    next();
  };
};
