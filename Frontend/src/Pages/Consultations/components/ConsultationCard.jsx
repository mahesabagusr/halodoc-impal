import { Link } from "react-router-dom";
import { formatShortDate, formatCurrency } from "../helpers/formatters";
import {
  CreditCard,
  ClipboardList,
  UserRound,
  MessageSquare,
  Clock,
} from "lucide-react";
import { STATUS, PAYMENT } from "../../../constants/consultationConfig";

/**
 * Kartu konsultasi di halaman MyConsultations.
 * Menampilkan profil dokter, status, biaya, tanggal, dan tombol aksi.
 */
export default function ConsultationCard({ consultation }) {
  const s = STATUS[consultation.status] || STATUS.CANCELLED;
  const p = PAYMENT[consultation.paymentStatus] || PAYMENT.PENDING;
  const canChat = consultation.status === "ONGOING";
  const needsPayment = consultation.paymentStatus === "PENDING";

  return (
    <div
      className="bg-background relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
      }}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full ${s.accent}`} />

      <div className="flex flex-col gap-[13px] p-6">
        {/* Doctor profile */}
        {consultation.doctor && (
          <div className="flex items-center gap-3">
            <div className="bg-primary-light flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <UserRound size={16} strokeWidth={2} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-text-primary truncate text-[14px] font-semibold">
                {consultation.doctor.fullName}
              </p>
              {consultation.doctor.specialization && (
                <p className="text-text-secondary text-[11px]">
                  {consultation.doctor.specialization}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Divider after doctor row */}
        {consultation.doctor && <div className="bg-border h-px" />}

        {/* Status header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}
            >
              <s.Icon size={18} strokeWidth={2} className={s.text} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.bg} ${s.text}`}
                >
                  {s.label}
                </span>
                {canChat && (
                  <span className="relative flex h-2 w-2">
                    <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
                  </span>
                )}
              </div>
              <p className="text-text-secondary mt-1 text-[12px] leading-snug">
                {s.desc}
              </p>
            </div>
          </div>

          {/* Payment badge */}
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${p.bg} ${p.text}`}
          >
            {p.label}
          </span>
        </div>

        {/* Divider */}
        <div className="bg-border h-px" />

        {/* Info strip — 2 columns */}
        <div className="grid grid-cols-2 gap-[13px]">
          <div className="bg-surface rounded-xl px-3 py-2.5">
            <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
              Biaya
            </p>
            <p className="text-primary mt-1 text-[13px] font-bold">
              {formatCurrency(consultation.fee)}
            </p>
          </div>
          <div className="bg-surface rounded-xl px-3 py-2.5">
            <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
              Tanggal
            </p>
            <p className="text-text-secondary mt-1 text-[11px] leading-snug font-semibold">
              {formatShortDate(consultation.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[13px]">
          {needsPayment && consultation.status !== "CANCELLED" && (
            <Link
              to={`/consultations/${consultation.id}/payment`}
              id={`pay-btn-${consultation.id}`}
              className="bg-warning flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#D97706]"
            >
              <CreditCard size={15} strokeWidth={2} />
              Bayar Sekarang
            </Link>
          )}

          {canChat && (
            <Link
              to={`/consultations/${consultation.id}/chat`}
              id={`chat-btn-${consultation.id}`}
              className="bg-primary hover:bg-primary-hover flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[14px] font-semibold text-white transition-all duration-150"
            >
              <MessageSquare size={15} strokeWidth={2} />
              Masuk Chat
            </Link>
          )}

          {consultation.status === "REQUESTED" &&
            consultation.paymentStatus === "PAID" && (
              <div className="bg-warning-light text-warning flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[14px] font-semibold">
                <Clock size={15} strokeWidth={2} />
                Menunggu Konfirmasi
              </div>
            )}

          {consultation.status === "COMPLETED" && (
            <Link
              to={`/consultations/${consultation.id}/chat`}
              id={`history-btn-${consultation.id}`}
              className="bg-surface text-text-secondary hover:bg-primary-light hover:text-primary flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[14px] font-semibold transition-all duration-150"
            >
              <ClipboardList size={15} strokeWidth={2} />
              Lihat Riwayat Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
