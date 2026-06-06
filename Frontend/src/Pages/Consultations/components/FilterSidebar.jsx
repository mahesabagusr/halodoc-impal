import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── Collapsible section ────────────────────────────────────────────── */
function SideSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-text-primary flex w-full items-center justify-between py-2 text-[13px] font-semibold"
      >
        {title}
        {open ? (
          <ChevronUp size={13} strokeWidth={2} className="text-text-secondary" />
        ) : (
          <ChevronDown size={13} strokeWidth={2} className="text-text-secondary" />
        )}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
}

/* ─── Filter option pill ─────────────────────────────────────────────── */
function Option({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-2.5 py-2 text-center text-[12px] font-medium transition-all duration-150 ${
        active
          ? "bg-primary text-white"
          : "bg-background text-text-secondary hover:bg-primary-light hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Sidebar filter untuk halaman MyConsultations.
 * Menyaring berdasarkan status, pembayaran, tanggal, dan urutan.
 */
export default function FilterSidebar({ filters, onChange, onReset }) {
  const hasActive =
    filters.status !== "ALL" ||
    filters.payment !== "ALL" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.sort !== "DATE_DESC";

  return (
    /* Sidebar width 288px per DESIGN.md §5 */
    <aside className="w-72 shrink-0">
      <div className="bg-surface sticky top-20 rounded-2xl p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={2} className="text-primary" />
            <span className="text-text-primary text-[14px] font-semibold">
              Filter
            </span>
          </div>
          {hasActive && (
            <button
              onClick={onReset}
              className="text-error hover:bg-error-light flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-semibold transition"
            >
              <RotateCcw size={11} strokeWidth={2} />
              Reset
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="bg-border mb-5 h-px" />

        <div className="space-y-5">
          {/* Status konsultasi — 2 cols */}
          <SideSection title="Status Konsultasi">
            <div className="grid grid-cols-2 gap-1.5">
              <Option
                active={filters.status === "ALL"}
                onClick={() => onChange("status", "ALL")}
              >
                Semua
              </Option>
              <Option
                active={filters.status === "ONGOING"}
                onClick={() => onChange("status", "ONGOING")}
              >
                Berlangsung
              </Option>
              <Option
                active={filters.status === "REQUESTED"}
                onClick={() => onChange("status", "REQUESTED")}
              >
                Menunggu
              </Option>
              <Option
                active={filters.status === "COMPLETED"}
                onClick={() => onChange("status", "COMPLETED")}
              >
                Selesai
              </Option>
            </div>
          </SideSection>

          <div className="bg-border h-px" />

          {/* Status pembayaran — 2 cols */}
          <SideSection title="Status Pembayaran">
            <div className="grid grid-cols-2 gap-1.5">
              <Option
                active={filters.payment === "ALL"}
                onClick={() => onChange("payment", "ALL")}
              >
                Semua
              </Option>
              <Option
                active={filters.payment === "PENDING"}
                onClick={() => onChange("payment", "PENDING")}
              >
                Belum Bayar
              </Option>
              <Option
                active={filters.payment === "PAID"}
                onClick={() => onChange("payment", "PAID")}
              >
                Sudah Bayar
              </Option>
              <Option
                active={filters.payment === "REFUNDED"}
                onClick={() => onChange("payment", "REFUNDED")}
              >
                Dikembalikan
              </Option>
            </div>
          </SideSection>

          <div className="bg-border h-px" />

          {/* Rentang tanggal */}
          <SideSection title="Rentang Tanggal">
            <div className="space-y-2">
              <div>
                <label
                  htmlFor="filter-date-from"
                  className="text-text-secondary mb-1.5 block text-[11px] font-semibold tracking-wider uppercase"
                >
                  Dari
                </label>
                <input
                  id="filter-date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange("dateFrom", e.target.value)}
                  className="border-border bg-background text-text-primary focus:border-primary w-full rounded-xl border px-3 py-2 text-[13px] transition outline-none focus:shadow-[0_0_0_3px_rgba(255,92,138,0.1)]"
                />
              </div>
              <div>
                <label
                  htmlFor="filter-date-to"
                  className="text-text-secondary mb-1.5 block text-[11px] font-semibold tracking-wider uppercase"
                >
                  Sampai
                </label>
                <input
                  id="filter-date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange("dateTo", e.target.value)}
                  className="border-border bg-background text-text-primary focus:border-primary w-full rounded-xl border px-3 py-2 text-[13px] transition outline-none focus:shadow-[0_0_0_3px_rgba(255,92,138,0.1)]"
                />
              </div>
            </div>
          </SideSection>

          <div className="bg-border h-px" />

          {/* Urutkan — 2 cols */}
          <SideSection title="Urutkan">
            <div className="grid grid-cols-2 gap-1.5">
              <Option
                active={filters.sort === "DATE_DESC"}
                onClick={() => onChange("sort", "DATE_DESC")}
              >
                Terbaru
              </Option>
              <Option
                active={filters.sort === "DATE_ASC"}
                onClick={() => onChange("sort", "DATE_ASC")}
              >
                Terlama
              </Option>
              <Option
                active={filters.sort === "STATUS"}
                onClick={() => onChange("sort", "STATUS")}
              >
                Aktif Dulu
              </Option>
              <Option
                active={filters.sort === "FEE_DESC"}
                onClick={() => onChange("sort", "FEE_DESC")}
              >
                Biaya Tinggi
              </Option>
              <Option
                active={filters.sort === "FEE_ASC"}
                onClick={() => onChange("sort", "FEE_ASC")}
              >
                Biaya Rendah
              </Option>
            </div>
          </SideSection>
        </div>
      </div>
    </aside>
  );
}
