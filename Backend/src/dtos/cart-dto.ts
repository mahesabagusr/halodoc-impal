import { z } from "zod";
import {
  AddCartItemSchema,
  CheckoutSchema,
  RemoveCartItemSchema,
} from "@/schemas/cart-schema";

export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;
export type RemoveCartItemDto = z.infer<typeof RemoveCartItemSchema>;
export type CheckoutDto = z.infer<typeof CheckoutSchema>;
