/* ─────────────────────────────────────────────────────────────────────────
 * Consultation Helpers — formatters.js
 * Semua pure-function helpers untuk fitur Consultations dikumpulkan di sini
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Format timestamp menjadi jam:menit (WIB)
 * @example "14:30"
 */
export function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format timestamp menjadi tanggal lengkap
 * @example "Senin, 2 Juni 2026"
 */
export function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format angka menjadi format mata uang Rupiah
 * @example "Rp 50.000"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

/**
 * Format timestamp menjadi tanggal singkat + jam
 * @example "2 Jun 2026, 14:30"
 */
export function formatShortDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Menampilkan waktu relatif dari timestamp
 * @example "5 menit yang lalu"
 */
export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}d yang lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
  return `${Math.floor(diff / 3600)} jam yang lalu`;
}

/**
 * Hitung sisa waktu countdown dari createdAt (konsultasi expire dalam 5 menit)
 * @returns {{ remaining: number, label: string }}
 */
export function formatCountdown(createdAt) {
  const expiredAt = new Date(createdAt).getTime() + 5 * 60 * 1000;
  const remaining = Math.max(0, Math.floor((expiredAt - Date.now()) / 1000));
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return { remaining, label: `${m}:${s.toString().padStart(2, "0")}` };
}

/**
 * Decode role dari JWT token (tanpa library)
 * @returns {string|null} role — "DOCTOR" | "PATIENT" | null
 */
export function decodeTokenRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role || null;
  } catch {
    return null;
  }
}

/**
 * Decode userId dari JWT token (tanpa library)
 * @returns {number|null}
 */
export function decodeTokenUserId(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).userId || null;
  } catch {
    return null;
  }
}
