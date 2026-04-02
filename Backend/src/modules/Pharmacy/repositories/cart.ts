import prisma from "@/helpers/db/prisma/client";
import { Cart, Prisma } from "@prisma/client";
import { CheckoutDto } from "@/dtos/cart-dto";
import { BadRequestError } from "@/helpers/error";
import { OrderWithItems } from "@/interfaces/cart-interface";

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: true;
  };
}>;

export default class CartRepository {
  static async findOrCreateCart(
    userId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Cart> {
    const client = tx ?? prisma;

    const existing = await client.cart.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return client.cart.create({
      data: { userId },
    });
  }

  static async findCartWithItems(userId: number) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }) as Promise<CartWithItems | null>;
  }

  static async findProductById(productId: number) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  static async upsertCartItem(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItemWithProduct> {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  static async removeCartItem(cartId: number, cartItemId: number) {
    return prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        cartId,
      },
    });
  }

  static async checkout(
    userId: number,
    payload: CheckoutDto,
  ): Promise<OrderWithItems> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
        throw new BadRequestError("Cart kosong, checkout tidak dapat diproses");
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
    });
  }
}
