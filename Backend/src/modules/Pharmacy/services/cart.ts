import * as wrapper from "@/helpers/utils/wrapper";
import prisma from "@/helpers/db/prisma/client";
import { BadRequestError, NotFoundError } from "@/helpers/error";
import CartRepository from "@/modules/Pharmacy/repositories/cart";
import { AddCartItemDto, CheckoutDto } from "@/dtos/cart-dto";
import { ResponseResult } from "@/interfaces/wrapper-interface";
import { Prisma } from "@prisma/client";
import {
  CartItemWithProduct,
  CartResponse,
  OrderWithItems,
} from "@/interfaces/cart-interface";

export default class CartService {
  static async getMyCart(
    userId: number,
  ): Promise<ResponseResult<CartResponse>> {
    try {
      const cart = await CartRepository.findCartWithItems(userId);

      if (!cart) {
        return wrapper.data({
          items: [],
          totalAmount: 0,
        });
      }

      const totalAmount = cart.items.reduce((acc: number, item) => {
        return acc + item.quantity * item.product.price;
      }, 0);

      return wrapper.data({
        id: cart.id,
        items: cart.items,
        totalAmount,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async addItem(
    userId: number,
    payload: AddCartItemDto,
  ): Promise<ResponseResult<CartItemWithProduct>> {
    try {
      const product = await CartRepository.findProductById(payload.productId);

      if (!product) {
        return wrapper.error(new NotFoundError("Product not found"));
      }

      if (product.stock < payload.quantity) {
        return wrapper.error(new BadRequestError("Stock tidak mencukupi"));
      }

      const cart = await CartRepository.findOrCreateCart(userId);

      const item = await CartRepository.upsertCartItem(
        cart.id,
        payload.productId,
        payload.quantity,
      );

      return wrapper.data(item);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async removeItem(
    userId: number,
    cartItemId: number,
  ): Promise<ResponseResult<string>> {
    try {
      const cart = await CartRepository.findOrCreateCart(userId);
      const deleted = await CartRepository.removeCartItem(cart.id, cartItemId);

      if (!deleted.count) {
        return wrapper.error(new NotFoundError("Cart item tidak ditemukan"));
      }

      return wrapper.data("Cart item berhasil dihapus");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }

  static async checkout(
    userId: number,
    payload: CheckoutDto,
  ): Promise<ResponseResult<OrderWithItems>> {
    try {
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          });

          if (!cart || cart.items.length === 0) {
            throw new BadRequestError(
              "Cart kosong, checkout tidak dapat diproses",
            );
          }

          for (const item of cart.items) {
            const deducted = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            if (deducted.count === 0) {
              throw new BadRequestError(
                `Stock produk ${item.product.name} tidak mencukupi`,
              );
            }
          }

          const totalAmount = cart.items.reduce((acc: number, item) => {
            return acc + item.quantity * item.product.price;
          }, 0);

          const order = await tx.order.create({
            data: {
              userId,
              totalAmount,
              shippingAddress: payload.shippingAddress,
              status: "PENDING",
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.price,
                })),
              },
            },
            include: {
              items: true,
            },
          });

          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });

          return order;
        },
      );

      return wrapper.data(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        return wrapper.error(err);
      }

      const message = err instanceof Error ? err.message : String(err);
      return wrapper.error(new BadRequestError(message));
    }
  }
}
