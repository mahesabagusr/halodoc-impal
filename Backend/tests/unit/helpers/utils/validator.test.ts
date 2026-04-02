import { describe, expect, it } from "vitest";
import { z } from "zod";
import { isValidPayload } from "@/helpers/utils/validator";
import { BadRequestError, NotFoundError } from "@/helpers/error";

describe("isValidPayload", () => {
  it("returns parsed data for valid payload", async () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().int().positive(),
    });

    const result = await isValidPayload({ name: "A", age: 20 }, schema);

    expect(result.err).toBeNull();
    expect(result.data).toEqual({ name: "A", age: 20 });
  });

  it("returns BadRequestError for invalid payload", async () => {
    const schema = z.object({
      name: z.string().min(3, "name too short"),
    });

    const result = await isValidPayload({ name: "ab" }, schema);

    expect(result.err).toBeInstanceOf(BadRequestError);
    expect(result.data).toBeNull();
    expect(result.err?.message).toContain("name too short");
  });

  it("returns NotFoundError for unknown non-zod error", async () => {
    const schema = {
      parse: () => {
        throw new Error("random");
      },
    } as unknown as z.ZodSchema<{ sample: string }>;

    const result = await isValidPayload({ sample: "x" }, schema);

    expect(result.err).toBeInstanceOf(NotFoundError);
    expect(result.data).toBeNull();
  });
});
