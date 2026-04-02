import { beforeEach, describe, expect, it, vi } from "vitest";
process.env.JWT_SECRET = "unit-test-secret";
import { createToken, decodeToken, verifyToken } from "@/middlewares/jwt";

beforeEach(() => {
  process.env.JWT_SECRET = "unit-test-secret";
});

describe("jwt middleware", () => {
  it("createToken and decodeToken should roundtrip payload", async () => {
    const tokenResult = createToken({
      userId: 10,
      email: "user@mail.com",
      role: "PATIENT",
    });

    const decoded = decodeToken(`Bearer ${tokenResult.accessToken}`) as any;

    expect(decoded.userId).toBe(10);
    expect(decoded.email).toBe("user@mail.com");
    expect(decoded.role).toBe("PATIENT");
  });

  it("verifyToken returns unauthorized when token missing", async () => {
    const req = { headers: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it("verifyToken should attach user and call next for valid token", async () => {
    const { accessToken } = createToken({
      userId: 99,
      email: "ok@mail.com",
      role: "DOCTOR",
    });

    const req = { headers: { authorization: `Bearer ${accessToken}` } } as any;
    const res = {} as any;
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      userId: 99,
      email: "ok@mail.com",
      role: "DOCTOR",
    });
  });
});
