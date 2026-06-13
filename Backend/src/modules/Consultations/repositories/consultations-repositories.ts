import prisma from "@/helpers/db/prisma/client";
import { ConsultationStatus, PaymentStatus } from "@prisma/client";

export default class ConsultationsRepository {
  static async cancelExpiredConsultations() {
    return prisma.consultation.updateMany({
      where: {
        status: "REQUESTED",
        createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
      },
      data: { status: "CANCELLED" },
    });
  }

  static async requestConsultation(
    patientId: number,
    doctorId: number,
    fee: number,
  ) {
    return prisma.consultation.create({
      data: {
        patientId,
        doctorId,
        fee,
      },
    });
  }

  static async getDoctorFee(doctorId: number): Promise<number | null> {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
      select: { consultationFee: true },
    });
    return profile?.consultationFee ?? null;
  }

  static async updateStatus(
    consultationId: number,
    status: ConsultationStatus,
  ) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { status },
    });
  }

  static async processPayment(consultationId: number) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { paymentStatus: "PAID" },
    });
  }

  static async updateMidtransData(
    consultationId: number,
    token: string,
    url: string,
    orderId?: string,
  ) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: {
        midtransToken: token,
        midtransUrl: orderId || url, // store orderId in midtransUrl if provided
      },
    });
  }

  static async updatePaymentStatus(
    consultationId: number,
    status: PaymentStatus,
  ) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { paymentStatus: status },
    });
  }

  static async getChatHistory(consultationId: number) {
    return prisma.message.findMany({
      where: { consultationId },
      orderBy: { timestamp: "asc" },
    });
  }

  static async sendMessage(
    consultationId: number,
    senderId: number,
    content: string,
  ) {
    return prisma.message.create({
      data: {
        consultationId,
        senderId,
        content,
      },
    });
  }

  static async generatePrescription(
    consultationId: number,
    notes?: string,
    items?: { productId?: number | null; customProductName?: string | null; dosage: string; quantity: number }[],
  ) {
    return prisma.prescription.create({
      data: {
        consultationId,
        notes,
        items: items
          ? {
              create: items.map((item) => ({
                productId: item.productId || null,
                customProductName: item.customProductName || null,
                dosage: item.dosage,
                quantity: item.quantity,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  static async updatePrescriptionNotes(prescriptionId: number, notes: string) {
    return prisma.prescription.update({
      where: { id: prescriptionId },
      data: { notes },
    });
  }

  static async addPrescriptionItem(
    prescriptionId: number,
    productId: number,
    dosage: string,
    quantity: number,
  ) {
    return prisma.prescriptionItem.create({
      data: {
        prescriptionId,
        productId,
        dosage,
        quantity,
      },
    });
  }

  static async removePrescriptionItem(itemId: number) {
    return prisma.prescriptionItem.delete({
      where: { id: itemId },
    });
  }

  static async getPrescriptionItems(prescriptionId: number) {
    return prisma.prescriptionItem.findMany({
      where: { prescriptionId },
      include: { product: true },
    });
  }

  static async getConsultationById(id: number) {
    return prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            telephoneNumber: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            doctorProfile: {
              select: {
                specialization: {
                  select: { name: true },
                },
              },
            },
          },
        },
        prescription: {
          include: {
            items: {
              include: { product: true },
            },
          },
        },
      },
    });
  }
}
