import { describe, expect, it, vi } from "vitest";
import { authorize } from "@/middlewares/authorization";
import * as wrapper from "@/helpers/utils/wrapper";

describe("authorize middleware", () => {
  it("calls next when user role is allowed", () => {
    const req = { user: { role: "ADMIN" } } as any;
    const res = {} as any;
    const next = vi.fn();

    const mw = authorize(["ADMIN"]);
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns forbidden response when user missing", () => {
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();
    const responseSpy = vi
      .spyOn(wrapper, "response")
      .mockImplementation(() => undefined);

    const mw = authorize(["ADMIN"]);
    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(responseSpy).toHaveBeenCalledTimes(1);

    responseSpy.mockRestore();
  });

  it("returns forbidden response when role is not allowed", () => {
    const req = { user: { role: "PATIENT" } } as any;
    const res = {} as any;
    const next = vi.fn();
    const responseSpy = vi
      .spyOn(wrapper, "response")
      .mockImplementation(() => undefined);

    const mw = authorize(["ADMIN"]);
    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(responseSpy).toHaveBeenCalledTimes(1);

    responseSpy.mockRestore();
  });
});
