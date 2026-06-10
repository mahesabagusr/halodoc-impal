import { z } from "zod";

export const RequestConsultationSchema = z.object({
  doctorId: z.number().int().positive("Invalid doctor ID"),
});

export const UpdateConsultationStatusSchema = z.object({
  status: z.enum(["REQUESTED", "ONGOING", "COMPLETED", "CANCELLED"]),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

export const PrescriptionItemSchema = z
  .object({
    productId: z.number().int().positive().optional().nullable(),
    customProductName: z.string().optional().nullable(),
    dosage: z.string().min(1, "Dosage is required"),
    quantity: z.number().int().positive("Quantity must be greater than 0"),
  })
  .refine((data) => data.productId || data.customProductName, {
    message: "Either productId or customProductName must be provided",
    path: ["productId"],
  });

export const CreatePrescriptionSchema = z.object({
  notes: z.string().optional(),
  items: z
    .array(PrescriptionItemSchema)
    .min(1, "At least one item is required"),
});
