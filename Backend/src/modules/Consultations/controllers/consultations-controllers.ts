import * as wrapper from "@/helpers/utils/wrapper";
import {
  ERROR as httpError,
  SUCCESS as http,
} from "@/helpers/http-status/statusCode";
import logger from "@/helpers/utils/winston";
import { Request, Response } from "express";
import ConsultationsService from "@/modules/Consultations/services/consultations-services";
import ConsultationsRepository from "@/modules/Consultations/repositories/consultations-repositories";
import { ConsultationStatus } from "@/generated/prisma";
import { getIO, emitMessageSafely } from "@/helpers/utils/socket";
import prisma from "@/helpers/db/prisma/client";
import { CreatePrescriptionSchema } from "@/schemas/consultation-schema";

export const requestConsultation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const patientId = req.user!.userId;
    const doctorId = parseInt(req.body.doctorId as string, 10);
    const result = await ConsultationsService.requestConsultation(
      patientId,
      doctorId,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to request consultation",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Consultation requested",
      http.CREATED,
    );
  } catch (err: unknown) {
    logger.error(
      `Error requesting consultation: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const respondToConsultation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const doctorId = req.user!.userId;
    const consultationId = parseInt(req.params.id as string, 10);
    const { action } = req.body;

    const result = await ConsultationsService.respondToConsultation(
      consultationId,
      doctorId,
      action,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to respond to consultation",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      `Consultation ${action.toLowerCase()}ed`,
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error responding to consultation: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);
    const { status } = req.body;
    const result = await ConsultationsService.updateStatus(
      consultationId,
      status as ConsultationStatus,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to update status",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(res, "success", result, "Status updated", http.OK);
  } catch (err: unknown) {
    logger.error(
      `Error updating consultation status: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const processPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);
    const result = await ConsultationsService.processPayment(consultationId);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to process payment",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Payment URL generated",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error processing payment: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const getConsultationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);
    const result =
      await ConsultationsService.getConsultationById(consultationId);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to get consultation",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Consultation fetched",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error fetching consultation: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const midtransWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await ConsultationsService.handleMidtransWebhook(req.body);

    if (result.err) {
      // Return 200 even on error so Midtrans doesn't retry infinitely unless it's a critical error
      logger.error(`Webhook error: ${result.err}`);
      res.status(200).send("OK");
      return;
    }

    res.status(200).send("OK");
  } catch (err: unknown) {
    logger.error(
      `Error handling webhook: ${err instanceof Error ? err.message : String(err)}`,
    );
    res.status(200).send("OK");
  }
};

export const getChatHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);
    const result = await ConsultationsService.getChatHistory(consultationId);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to get chat history",
        httpError.BAD_REQUEST,
      );
    }

    return wrapper.response(
      res,
      "success",
      result,
      "Chat history retrieved",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error fetching chat history: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const senderId = req.user!.userId;
    const consultationId = parseInt(req.params.id as string, 10);
    const { content } = req.body;

    const result = await ConsultationsService.sendMessage(
      consultationId,
      senderId,
      content,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to send message",
        httpError.BAD_REQUEST,
      );
    }

    emitMessageSafely(consultationId, result.data);

    return wrapper.response(
      res,
      "success",
      result,
      "Message sent",
      http.CREATED,
    );
  } catch (err: unknown) {
    logger.error(
      `Error sending message: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const generatePrescription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);

    // Validate request body
    const parsed = CreatePrescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return wrapper.response(
        res,
        "fail",
        wrapper.error(new Error(parsed.error.issues[0].message)),
        "Validation Error",
        httpError.BAD_REQUEST,
      );
    }

    const { notes, items } = parsed.data;

    const result = await ConsultationsService.generatePrescription(
      consultationId,
      notes,
      items,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to generate prescription",
        httpError.BAD_REQUEST,
      );
    }

    try {
      const consultation =
        await ConsultationsRepository.getConsultationById(consultationId);
      if (consultation) {
        getIO()
          .to(`user_${consultation.patientId}`)
          .emit("prescription_ready", {
            prescriptionId: result.data.id,
            consultationId,
          });
      }
    } catch (socketErr) {
      logger.error(
        `Socket error: ${socketErr instanceof Error ? socketErr.message : String(socketErr)}`,
      );
    }

    return wrapper.response(
      res,
      "success",
      result,
      "Prescription generated",
      http.CREATED,
    );
  } catch (err: unknown) {
    logger.error(
      `Error generating prescription: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const updatePrescriptionNotes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const prescriptionId = parseInt(req.params.prescriptionId as string, 10);
    const { notes } = req.body;

    const result = await ConsultationsService.updatePrescriptionNotes(
      prescriptionId,
      notes,
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to update prescription notes",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Prescription notes updated",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error updating prescription notes: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const addPrescriptionItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const prescriptionId = parseInt(req.params.prescriptionId as string, 10);
    const { productId, dosage, quantity } = req.body;

    const result = await ConsultationsService.addPrescriptionItem(
      prescriptionId,
      { productId, dosage, quantity },
    );

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to add prescription item",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Prescription item added",
      http.CREATED,
    );
  } catch (err: unknown) {
    logger.error(
      `Error adding prescription item: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const removePrescriptionItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const itemId = parseInt(req.params.itemId as string, 10);
    const result = await ConsultationsService.removePrescriptionItem(itemId);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to remove prescription item",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Prescription item removed",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error removing prescription item: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

/**
 * GET /consultations/my
 * Returns all consultations for the currently authenticated user.
 * - PATIENT  → consultations where patientId = userId
 * - DOCTOR   → consultations where doctorId  = userId
 */
export const getMyConsultations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const consultations = await prisma.consultation.findMany({
      where: role === "DOCTOR" ? { doctorId: userId } : { patientId: userId },
      include: {
        prescription: {
          include: { items: { include: { product: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // For doctor: include patient name; for patient: include doctor name + specialization
    let result: any[] = consultations;
    if (role === "DOCTOR") {
      result = await Promise.all(
        consultations.map(async (c) => {
          const patient = await prisma.user.findUnique({
            where: { id: c.patientId },
            select: { id: true, fullName: true, email: true },
          });
          return { ...c, patient };
        }),
      );
    } else {
      result = await Promise.all(
        consultations.map(async (c) => {
          const doctor = await prisma.user.findUnique({
            where: { id: c.doctorId },
            select: {
              id: true,
              fullName: true,
              doctorProfile: {
                select: {
                  specialization: { select: { name: true } },
                },
              },
            },
          });
          return {
            ...c,
            doctor: doctor
              ? {
                  id: doctor.id,
                  fullName: doctor.fullName,
                  specialization:
                    doctor.doctorProfile?.specialization?.name ?? null,
                }
              : null,
          };
        }),
      );
    }

    return wrapper.response(
      res,
      "success",
      wrapper.data(result),
      "Consultations fetched",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error fetching my consultations: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const consultationId = parseInt(req.params.id as string, 10);
    const result =
      await ConsultationsService.verifyPaymentStatus(consultationId);

    if (result.err) {
      return wrapper.response(
        res,
        "fail",
        result,
        "Failed to verify payment",
        httpError.BAD_REQUEST,
      );
    }
    return wrapper.response(
      res,
      "success",
      result,
      "Payment status verified",
      http.OK,
    );
  } catch (err: unknown) {
    logger.error(
      `Error verifying payment: ${err instanceof Error ? err.message : String(err)}`,
    );
    return wrapper.response(
      res,
      "fail",
      wrapper.error(err instanceof Error ? err : new Error(String(err))),
      "Internal Server Error",
      httpError.INTERNAL_ERROR,
    );
  }
};
