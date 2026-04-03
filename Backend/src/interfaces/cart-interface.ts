import { Prisma } from "@/generated/prisma";

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: true;
  };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

export interface CartResponse {
  id?: number;
  items: CartWithItems["items"];
  totalAmount: number;
}
