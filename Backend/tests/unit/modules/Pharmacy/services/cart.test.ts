import { beforeEach, describe, expect, it, vi } from "vitest";
import CartService from "@/modules/Pharmacy/services/cart";

const { prismaMock, cartRepoMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
  },
  cartRepoMock: {
    findCartWithItems: vi.fn(),
    findProductById: vi.fn(),
    findOrCreateCart: vi.fn(),
    upsertCartItem: vi.fn(),
    removeCartItem: vi.fn(),
  },
}));

vi.mock("@/helpers/db/prisma/client", () => ({
  default: prismaMock,
}));

vi.mock("@/modules/Pharmacy/repositories/cart", () => ({
  default: cartRepoMock,
}));

describe("CartService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMyCart should return empty cart when cart not found", async () => {
    cartRepoMock.findCartWithItems.mockResolvedValue(null);

    const result = await CartService.getMyCart(1);

    expect(result.err).toBeNull();
    expect(result.data).toEqual({ items: [], totalAmount: 0 });
  });

  it("addItem should fail when product not found", async () => {
    cartRepoMock.findProductById.mockResolvedValue(null);

    const result = await CartService.addItem(1, { productId: 10, quantity: 1 });

    expect(result.err?.message).toContain("Product not found");
    expect(result.data).toBeNull();
  });

  it("addItem should fail when stock is insufficient", async () => {
    cartRepoMock.findProductById.mockResolvedValue({ id: 10, stock: 0 });

    const result = await CartService.addItem(1, { productId: 10, quantity: 2 });

    expect(result.err?.message).toContain("Stock tidak mencukupi");
    expect(result.data).toBeNull();
  });

  it("removeItem should return success when delete count > 0", async () => {
    cartRepoMock.findOrCreateCart.mockResolvedValue({ id: 11 });
    cartRepoMock.removeCartItem.mockResolvedValue({ count: 1 });

    const result = await CartService.removeItem(1, 100);

    expect(result.err).toBeNull();
    expect(result.data).toBe("Cart item berhasil dihapus");
  });

  it("checkout should fail when cart is empty", async () => {
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: vi.fn().mockResolvedValue({ id: 1, items: [] }),
        },
      };

      return callback(tx);
    });

    const result = await CartService.checkout(1, {
      shippingAddress: "Jakarta Selatan",
    });

    expect(result.err?.message).toContain("Cart kosong");
    expect(result.data).toBeNull();
  });

  it("checkout should return order data when successful", async () => {
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: vi.fn().mockResolvedValue({
            id: 1,
            items: [
              {
                productId: 10,
                quantity: 2,
                product: { name: "Paracetamol", price: 10000 },
              },
            ],
          }),
        },
        product: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        order: {
          create: vi
            .fn()
            .mockResolvedValue({ id: 55, totalAmount: 20000, items: [] }),
        },
        cartItem: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };

      return callback(tx);
    });

    const result = await CartService.checkout(1, {
      shippingAddress: "Bandung Raya",
    });

    expect(result.err).toBeNull();
    expect(result.data).toEqual({ id: 55, totalAmount: 20000, items: [] });
  });
});
