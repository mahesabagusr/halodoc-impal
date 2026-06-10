import { Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * Layar status yang tampil ketika konsultasi sudah COMPLETED atau CANCELLED
 * dan tidak ada riwayat chat yang bisa ditampilkan.
 */
export default function StatusScreen({ status }) {
  const isCompleted = status === "COMPLETED";
  return (
    <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
      {isCompleted ? (
        <CheckCircle2 size={64} strokeWidth={1.5} className="mb-4 text-success" />
      ) : (
        <XCircle size={64} strokeWidth={1.5} className="mb-4 text-error" />
      )}
      <h2 className="text-[18px] font-semibold text-text-primary">
        {isCompleted ? "Konsultasi Selesai" : "Konsultasi Dibatalkan"}
      </h2>
      <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
        {isCompleted
          ? "Sesi konsultasi ini telah berakhir."
          : "Konsultasi ini telah dibatalkan."}
      </p>
      <Link
        to="/history"
        className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-hover"
      >
        Kembali ke Konsultasi Saya
      </Link>
    </div>
  );
}
