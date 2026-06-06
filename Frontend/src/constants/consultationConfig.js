import {
  Clock,
  MessageSquare,
  Check,
  X,
} from "lucide-react";

/* ─── Consultation status display config ─────────────────────────────── */
export const STATUS = {
  REQUESTED: {
    label: "Menunggu Dokter",
    Icon: Clock,
    bg: "bg-warning-light",
    text: "text-warning",
    accent: "bg-warning",
    desc: "Dokter belum menerima permintaan",
  },
  ONGOING: {
    label: "Sedang Berlangsung",
    Icon: MessageSquare,
    bg: "bg-success-light",
    text: "text-success",
    accent: "bg-success",
    desc: "Klik untuk masuk ke ruang chat",
  },
  COMPLETED: {
    label: "Selesai",
    Icon: Check,
    bg: "bg-surface",
    text: "text-text-secondary",
    accent: "bg-border",
    desc: "Konsultasi telah selesai",
  },
  CANCELLED: {
    label: "Dibatalkan",
    Icon: X,
    bg: "bg-error-light",
    text: "text-error",
    accent: "bg-error",
    desc: "Konsultasi dibatalkan",
  },
};

export const PAYMENT = {
  PENDING: {
    label: "Belum Bayar",
    text: "text-warning",
    bg: "bg-warning-light",
  },
  PAID: { label: "Sudah Bayar", text: "text-success", bg: "bg-success-light" },
  REFUNDED: {
    label: "Dikembalikan",
    text: "text-text-secondary",
    bg: "bg-surface",
  },
};

export const SORT_ORDER = { ONGOING: 0, REQUESTED: 1, COMPLETED: 2, CANCELLED: 3 };

/* ─── Payment page badge styles ──────────────────────────────────────── */
export const STATUS_STYLES = {
  REQUESTED: "bg-warning-light text-warning",
  ONGOING: "bg-warning-light text-warning",
  COMPLETED: "bg-success-light text-success",
  CANCELLED: "bg-error-light text-error",
};

export const PAYMENT_STYLES = {
  PENDING: "bg-warning-light text-warning",
  PAID: "bg-success-light text-success",
  REFUNDED: "bg-surface text-text-secondary",
};
