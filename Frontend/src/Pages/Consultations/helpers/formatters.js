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

/**
 * Membuka jendela print baru untuk mencetak invoice & resep medis konsultasi.
 */
export function printInvoice(consult) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const itemsHtml = consult.prescription?.items?.map(item => `
    <tr>
      <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">
        ${item.product?.name || "Obat"}
      </td>
      <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB; color: #4B5563;">
        ${item.dosage}
      </td>
      <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB; color: #4B5563; text-align: center;">
        ${item.quantity}
      </td>
    </tr>
  `).join("") || `
    <tr>
      <td colspan="3" style="padding: 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB; color: #9CA3AF; text-align: center;">
        Tidak ada resep obat tambahan
      </td>
    </tr>
  `;

  const html = `
    <html>
      <head>
        <title>Resep Dokter #${consult.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1F2937;
            padding: 40px;
            line-height: 1.5;
            background-color: #ffffff;
          }
          .prescription-card {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E5E7EB;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #EC4899;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 26px;
            font-weight: 700;
            color: #EC4899;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-size: 12px;
            color: #6B7280;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 30px;
          }
          .meta-block h3 {
            margin: 0 0 6px 0;
            font-size: 12px;
            text-transform: uppercase;
            color: #9CA3AF;
            letter-spacing: 0.05em;
            font-weight: 600;
          }
          .meta-block p {
            margin: 0;
            font-size: 15px;
            font-weight: 500;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #F9FAFB;
            text-align: left;
            padding: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #E5E7EB;
          }
          .notes-section {
            margin-top: 30px;
            background-color: #FFF5F7;
            border-left: 4px solid #EC4899;
            padding: 20px;
            border-radius: 8px;
          }
          .notes-title {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #BE185D;
            font-weight: 600;
          }
          .notes-content {
            margin: 0;
            font-size: 13px;
            color: #4B5563;
            white-space: pre-line;
          }
          .footer {
            text-align: center;
            margin-top: 60px;
            font-size: 12px;
            color: #9CA3AF;
            border-top: 1px solid #F3F4F6;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
            .prescription-card { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="prescription-card">
          <div class="header">
            <div>
              <div class="title">RESEP OBAT DIGITAL</div>
              <div class="subtitle">HaloHealth</div>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">No. Konsultasi: #${consult.id}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">
                Tanggal: ${new Date(consult.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div class="meta-info">
            <div class="meta-block">
              <h3>Informasi Pasien</h3>
              <p>${consult.patient?.fullName || "Pasien"}</p>
              <p style="font-size: 12px; color: #6B7280; margin-top: 2px;">Email: ${consult.patient?.email || "-"}</p>
              <p style="font-size: 12px; color: #6B7280; margin-top: 2px;">Telp: ${consult.patient?.telephoneNumber || "-"}</p>
            </div>
            <div class="meta-block">
              <h3>Dokter Pemeriksa</h3>
              <p>${consult.doctor?.fullName || "Dokter"}</p>
              <p style="font-size: 12px; color: #6B7280; margin-top: 2px;">Spesialisasi: ${consult.doctor?.doctorProfile?.specialization?.name || "Spesialis"}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nama Obat / Sediaan</th>
                <th>Dosis & Aturan Pakai</th>
                <th style="text-align: center; width: 80px;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          ${consult.prescription?.notes ? `
            <div class="notes-section">
              <h4 class="notes-title">Catatan & Petunjuk Dokter:</h4>
              <p class="notes-content">${consult.prescription.notes}</p>
            </div>
          ` : ""}

          <div class="footer">
            Dokumen ini merupakan resep obat digital resmi yang dikeluarkan oleh HaloHealth.<br>
            Tanda tangan basah tidak diperlukan.
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}
