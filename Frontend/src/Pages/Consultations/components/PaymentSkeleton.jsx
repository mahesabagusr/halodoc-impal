import { Loader2 } from "lucide-react";

/**
 * Loading skeleton untuk halaman pembayaran konsultasi.
 */
export default function PaymentSkeleton() {
  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="mx-auto max-w-xl px-4">
        <div className="bg-background animate-pulse space-y-4 rounded-xl p-8">
          <div className="bg-border mx-auto h-6 w-48 rounded" />
          <div className="bg-surface h-40 rounded-xl" />
          <div className="bg-border h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
