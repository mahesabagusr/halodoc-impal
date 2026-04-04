import * as wrapper from "@/helpers/utils/wrapper";
import {
  ERROR as httpError,
  SUCCESS as http,
} from "@/helpers/http-status/statusCode";
import logger from "@/helpers/utils/winston";
import { Request, Response } from "express";
import { isValidPayload } from "@/helpers/utils/validator";

export const addSpecialization = async (req: Request, res: Response) => {
  const { specialization } = req.body;
};
