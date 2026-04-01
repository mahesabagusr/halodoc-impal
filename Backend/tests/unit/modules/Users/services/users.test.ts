import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import * as jwtModule from "@/middlewares/jwt";
import UserService from "@/modules/Users/services/users";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/helpers/db/prisma/client", () => ({
  default: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("@/middlewares/jwt", () => ({
  createToken: vi.fn(),
}));

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register should return unauthorized error if email exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      email: "existing@mail.com",
    });

    const result = await UserService.register({
      fullName: "Test User",
      email: "existing@mail.com",
      password: "password123",
    });

    expect(result.err?.message).toContain("Email Already Exists");
    expect(result.data).toBeNull();
  });

  it("register should create user when email is new", async () => {
    const bcryptMock = bcrypt as any;

    prismaMock.user.findFirst.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hashed");
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      email: "new@mail.com",
      role: "PATIENT",
    });

    const result = await UserService.register({
      fullName: "New User",
      email: "new@mail.com",
      password: "password123",
    });

    expect(result.err).toBeNull();
    expect(result.data).toEqual({
      id: 1,
      email: "new@mail.com",
      role: "PATIENT",
    });
  });

  it("login should return token when credentials valid", async () => {
    const bcryptMock = bcrypt as any;

    prismaMock.user.findFirst.mockResolvedValue({
      id: 3,
      email: "user@mail.com",
      password: "hashed",
      role: "PATIENT",
    });
    bcryptMock.compare.mockResolvedValue(true);
    (jwtModule.createToken as any).mockReturnValue({ accessToken: "token123" });

    const result = await UserService.login({
      email: "user@mail.com",
      password: "password123",
    });

    expect(result.err).toBeNull();
    expect(result.data).toEqual({ token: "token123" });
  });

  it("getAllUsers should return users list", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 1, email: "a@mail.com" },
    ]);

    const result = await UserService.getAllUsers();

    expect(result.err).toBeNull();
    expect(result.data).toEqual([{ id: 1, email: "a@mail.com" }]);
  });
});
