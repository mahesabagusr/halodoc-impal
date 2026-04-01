import { z } from "zod";

export const AddCartItemSchema = z.object({
  productId: z.number().int().positive("Product ID tidak valid"),
  quantity: z.number().int().positive("Quantity minimal 1"),
});

export const RemoveCartItemSchema = z.object({
  cartItemId: z.number().int().positive("Cart item ID tidak valid"),
});

export const CheckoutSchema = z.object({
  shippingAddress: z.string().min(8, "Alamat pengiriman minimal 8 karakter"),
});
