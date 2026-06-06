import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

/**
 * Layar tunggu yang tampil ketika konsultasi berstatus REQUESTED + PAID.
 * Pasien menunggu dokter menerima konsultasi.
 */
export default function WaitingScreen({ consultationId }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
      {/* Pulsing ring animation */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-10" />
        <div className="absolute inset-2 animate-ping rounded-full bg-primary opacity-10" style={{ animationDelay: "150ms" }} />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-light">
          <Clock size={40} strokeWidth={1.75} className="text-primary" />
        </div>
      </div>

      <h2 className="text-[18px] font-semibold text-text-primary">
        Menunggu Dokter
      </h2>
      <p className="mt-2 max-w-sm text-[14px] leading-[1.55] text-text-secondary">
        Permintaan konsultasi Anda sudah dibayar. Dokter sedang memproses
        permintaan — halaman ini akan otomatis terbuka saat dokter menerima.
      </p>

      {/* Animated dots */}
      <div className="mt-6 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-text-secondary">
        Konsultasi #{consultationId} · Auto-refresh setiap 10 detik
      </p>

      <Link
        to="/history"
        className="mt-8 text-[13px] font-semibold text-primary hover:underline"
      >
        Kembali ke Daftar Konsultasi
      </Link>
    </div>
  );
}
