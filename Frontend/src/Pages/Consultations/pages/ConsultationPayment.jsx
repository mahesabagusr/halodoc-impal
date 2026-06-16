import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMidtrans } from "../../../hooks/useMidtrans";
import {
  useConsultationDetail,
  usePayConsultation,
  useVerifyPayment,
} from "../../../hooks/useConsultations";
import { AlertTriangle, UserRound, Stethoscope, CalendarDays } from "lucide-react";
import { formatCurrency, formatShortDate } from "../helpers/formatters";

import PaymentSkeleton from "../components/PaymentSkeleton";
import StatusBadge from "../components/StatusBadge";
import { STATUS_STYLES, PAYMENT_STYLES } from "../../../constants/consultationConfig";

export default function ConsultationPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoaded, pay } = useMidtrans();

  const {
    data: consultation,
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultationDetail(id);

  const queryClient = useQueryClient();

  // Recovery safety-net: if a payment was already initiated (midtransUrl set)
  // but the status is still PENDING, re-verify with Midtrans. This recovers
  // consultations that were paid but never marked PAID (e.g. webhook couldn't
  // reach localhost, or the user closed the success page early).
  const currentData = consultation?.data || consultation;
  const needsVerify =
    currentData?.paymentStatus === "PENDING" && !!currentData?.midtransUrl;
  const { data: verifyData } = useVerifyPayment(id, { enabled: needsVerify });

  useEffect(() => {
    if (verifyData?.data?.paymentStatus === "PAID") {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
    }
  }, [verifyData, id, queryClient]);

  const paymentMutation = usePayConsultation(id, {
    onSuccess: (res) => {
      if (res?.data?.midtransToken) {
        // orderId saved by the backend (stored in midtransUrl) — matches CONS-{id}-{timestamp}.
        // Pass it along so the success page can verify the payment status with Midtrans.
        const orderId = res.data.midtransUrl || `CONS-${id}-`;
        pay(
          res.data.midtransToken,
          (result) => {
            console.log("Success:", result);
            const oid = result?.order_id || orderId;
            const status = result?.transaction_status || "settlement";
            navigate(
              `/consultations/success?order_id=${encodeURIComponent(oid)}&transaction_status=${encodeURIComponent(status)}`,
            );
          },
          (result) => {
            console.log("Pending:", result);
            alert("Pembayaran pending. Silakan selesaikan pembayaran.");
          },
          (result) => {
            console.log("Error:", result);
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          () => {
            console.log("Popup ditutup.");
          },
        );
      }
    },
    onError: (err) => {
      console.error("Payment API Error", err);
      alert("Gagal memulai pembayaran. Silakan coba lagi.");
    },
  });

  if (isLoading) return <PaymentSkeleton />;

  if (isError) {
    return (
      <div className="bg-surface min-h-screen py-12">
        <div className="mx-auto max-w-xl px-4">
          <div className="bg-error-light flex flex-col items-center justify-center rounded-xl py-20 text-center">
            <AlertTriangle
              size={40}
              strokeWidth={1.75}
              className="text-error mb-4"
            />
            <h3 className="text-text-primary text-[16px] font-semibold">
              Gagal memuat detail pembayaran
            </h3>
            <p className="text-text-secondary mt-1 max-w-sm text-[14px]">
              {error?.message || "Terjadi kesalahan. Coba lagi."}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-primary hover:bg-primary-hover mt-6 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const consData = consultation?.data || consultation;
  const isPaid = consData?.paymentStatus === "PAID";
  const doctor = consData?.doctor;
  const specialization = doctor?.doctorProfile?.specialization?.name;

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Payment Card ─────────────────────────────────────────────── */}
      <section className="py-[34px] sm:py-[55px]">
        <div className="mx-auto max-w-[550px] px-4 sm:px-6">
          <div className="bg-background overflow-hidden rounded-[21px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            {/* Card Header */}
            <div className="border-border bg-surface border-b px-6 py-4">
              <h2 className="text-text-secondary text-[14px] font-semibold tracking-wider uppercase">
                Ringkasan Pesanan
              </h2>
            </div>

            {/* Doctor profile */}
            {doctor && (
              <div className="border-border flex items-center gap-4 border-b px-6 py-5">
                <div className="bg-primary-light flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                  <UserRound
                    size={26}
                    strokeWidth={1.75}
                    className="text-primary"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-text-secondary text-[11px] font-bold tracking-wider uppercase">
                    Dokter
                  </p>
                  <p className="text-text-primary truncate text-[16px] font-semibold">
                    {doctor.fullName}
                  </p>
                  {specialization && (
                    <span className="text-primary mt-1 inline-flex items-center gap-1 text-[12px] font-medium">
                      <Stethoscope size={13} strokeWidth={2} />
                      {specialization}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="divide-border divide-y px-6">
              <div className="flex items-center justify-between py-4">
                <span className="text-text-secondary text-[14px]">
                  ID Konsultasi
                </span>
                <span className="text-text-primary font-semibold">
                  CONS-{consData?.id}
                </span>
              </div>

              {consData?.createdAt && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-text-secondary flex items-center gap-1.5 text-[14px]">
                    <CalendarDays size={15} strokeWidth={2} />
                    Tanggal Konsultasi
                  </span>
                  <span className="text-text-primary text-[14px] font-semibold">
                    {formatShortDate(consData.createdAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-4">
                <span className="text-text-secondary text-[14px]">
                  Status Konsultasi
                </span>
                <StatusBadge
                  value={consData?.status}
                  styleMap={STATUS_STYLES}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-text-secondary text-[14px]">
                  Status Pembayaran
                </span>
                <StatusBadge
                  value={consData?.paymentStatus}
                  styleMap={PAYMENT_STYLES}
                />
              </div>

              <div className="flex items-center justify-between py-5">
                <span className="text-text-primary text-[16px] font-semibold">
                  Total Biaya
                </span>
                <span className="text-primary text-[24px] font-bold">
                  {formatCurrency(consData?.fee)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="border-border border-t px-6 py-5">
              <button
                id="pay-button"
                onClick={() => paymentMutation.mutate()}
                disabled={!isLoaded || paymentMutation.isPending || isPaid}
                className={`w-full rounded-xl py-[13px] text-[14px] leading-[1] font-semibold tracking-[0.01em] transition-all duration-150 ${
                  isPaid
                    ? "bg-success cursor-not-allowed text-white"
                    : "bg-primary hover:bg-primary-hover disabled:bg-border text-white disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                }`}
              >
                {paymentMutation.isPending
                  ? "Memproses..."
                  : isPaid
                    ? "Sudah Dibayar"
                    : "Bayar"}
              </button>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <a
              href="/consultations"
              className="text-primary text-[14px] font-semibold hover:underline"
            >
              Kembali ke Daftar Dokter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
