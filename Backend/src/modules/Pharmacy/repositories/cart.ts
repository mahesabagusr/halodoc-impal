import prisma from "@/helpers/db/prisma/client";

export default class CartRepository {
  static async findOrCreateCart(userId: number, tx?: any) {
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
    });
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
  ) {
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
}
