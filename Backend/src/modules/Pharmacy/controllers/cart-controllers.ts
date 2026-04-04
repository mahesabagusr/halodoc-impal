import { Request, Response } from "express";
import * as wrapper from "@/helpers/utils/wrapper";
import {
  ERROR as httpError,
  SUCCESS as http,
} from "@/helpers/http-status/statusCode";
import { isValidPayload } from "@/helpers/utils/validator";
import {
  AddCartItemSchema,
  CheckoutSchema,
  RemoveCartItemSchema,
} from "@/schemas/cart-schema";
import CartService from "@/modules/Pharmacy/services/cart-services";
import {
  AddCartItemDto,
  CheckoutDto,
  RemoveCartItemDto,
} from "@/dtos/cart-dto";

export const getMyCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return wrapper.response(
      res,
      "fail",
      wrapper.error(new Error("Unauthorized")),
      "Unauthorized",
      httpError.UNAUTHORIZED,
    );
  }

  const result = await CartService.getMyCart(userId);

  if (result.err) {
    return wrapper.response(
      res,
      "fail",
      result,
      "Failed to fetch cart",
      httpError.BAD_REQUEST,
    );
  }

  return wrapper.response(res, "success", result, "Cart fetched", http.OK);
};

export const addItemToCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return wrapper.response(
      res,
      "fail",
      wrapper.error(new Error("Unauthorized")),
      "Unauthorized",
      httpError.UNAUTHORIZED,
    );
  }

  const payload: AddCartItemDto = { ...req.body };
  const validatePayload = await isValidPayload(payload, AddCartItemSchema);

  if (validatePayload.err || !validatePayload.data) {
    return wrapper.response(
      res,
      "fail",
      { err: validatePayload.err ?? new Error("Invalid payload"), data: null },
      "Invalid Payload",
      httpError.BAD_REQUEST,
    );
  }

  const result = await CartService.addItem(userId, validatePayload.data);

  if (result.err) {
    return wrapper.response(
      res,
      "fail",
      result,
      "Failed to add item",
      httpError.BAD_REQUEST,
    );
  }

  return wrapper.response(
    res,
    "success",
    result,
    "Item added to cart",
    http.CREATED,
  );
};

export const removeCartItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return wrapper.response(
      res,
      "fail",
      wrapper.error(new Error("Unauthorized")),
      "Unauthorized",
      httpError.UNAUTHORIZED,
    );
  }

  const payload: RemoveCartItemDto = {
    cartItemId: Number(req.params.cartItemId),
  };
  const validatePayload = await isValidPayload(payload, RemoveCartItemSchema);

  if (validatePayload.err || !validatePayload.data) {
    return wrapper.response(
      res,
      "fail",
      { err: validatePayload.err ?? new Error("Invalid param"), data: null },
      "Invalid Param",
      httpError.BAD_REQUEST,
    );
  }

  const result = await CartService.removeItem(
    userId,
    validatePayload.data.cartItemId,
  );

  if (result.err) {
    return wrapper.response(
      res,
      "fail",
      result,
      "Failed to remove item",
      httpError.BAD_REQUEST,
    );
  }

  return wrapper.response(res, "success", result, "Item removed", http.OK);
};

export const checkoutCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    return wrapper.response(
      res,
      "fail",
      wrapper.error(new Error("Unauthorized")),
      "Unauthorized",
      httpError.UNAUTHORIZED,
    );
  }

  const payload: CheckoutDto = { ...req.body };
  const validatePayload = await isValidPayload(payload, CheckoutSchema);

  if (validatePayload.err || !validatePayload.data) {
    return wrapper.response(
      res,
      "fail",
      { err: validatePayload.err ?? new Error("Invalid payload"), data: null },
      "Invalid Payload",
      httpError.BAD_REQUEST,
    );
  }

  const result = await CartService.checkout(userId, validatePayload.data);

  if (result.err) {
    return wrapper.response(
      res,
      "fail",
      result,
      "Checkout failed",
      httpError.BAD_REQUEST,
    );
  }

  return wrapper.response(
    res,
    "success",
    result,
    "Checkout success",
    http.CREATED,
  );
};
