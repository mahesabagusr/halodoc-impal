import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useMyConsultations } from "../../../hooks/useConsultations";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../lib/socket";
import { Plus, RotateCcw, AlertTriangle, Stethoscope } from "lucide-react";

import FilterSidebar from "../components/FilterSidebar";
import ConsultationCard from "../components/ConsultationCard";
import { SORT_ORDER } from "../../../constants/consultationConfig";

/* ─── Default filter state ───────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  status: "ALL",
  payment: "ALL",
  dateFrom: "",
  dateTo: "",
  sort: "DATE_DESC",
};

/* ══════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                              */
/* ══════════════════════════════════════════════════════════════════════ */
export default function MyConsultations() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyConsultations();
  const consultations = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
      ? raw
      : [];

  /* ── Socket refresh ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
    socket.on("consultation_accepted", refresh);
    socket.on("consultation_started", refresh);
    socket.on("consultation_session_ended", refresh);
    return () => {
      socket.off("consultation_accepted", refresh);
      socket.off("consultation_started", refresh);
      socket.off("consultation_session_ended", refresh);
    };
  }, [token, queryClient]);

  /* ── Poll when waiting ───────────────────────────────────────────── */
  useEffect(() => {
    const hasPending = consultations.some(
      (c) => c.status === "REQUESTED" && c.paymentStatus === "PAID",
    );
    if (!hasPending) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
    }, 10000);
    return () => clearInterval(interval);
  }, [consultations, queryClient]);

  /* ── Filter + sort ───────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = consultations.filter((c) => c.status !== "CANCELLED");

    if (filters.status !== "ALL")
      list = list.filter((c) => c.status === filters.status);
    if (filters.payment !== "ALL")
      list = list.filter((c) => c.paymentStatus === filters.payment);
    if (filters.dateFrom)
      list = list.filter(
        (c) => new Date(c.createdAt) >= new Date(filters.dateFrom),
      );
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((c) => new Date(c.createdAt) <= end);
    }

    switch (filters.sort) {
      case "DATE_ASC":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "STATUS":
        list.sort((a, b) => {
          const d = (SORT_ORDER[a.status] ?? 9) - (SORT_ORDER[b.status] ?? 9);
          return d !== 0 ? d : new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
      case "FEE_DESC":
        list.sort((a, b) => (b.fee ?? 0) - (a.fee ?? 0));
        break;
      case "FEE_ASC":
        list.sort((a, b) => (a.fee ?? 0) - (b.fee ?? 0));
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [consultations, filters]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="border-border bg-background border-b">
        <div className="mx-auto max-w-[1152px] px-4 py-[21px] sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-text-primary text-[18px] leading-[1.40] font-semibold">
                Konsultasi Saya
              </h1>
              <p className="text-text-secondary mt-0.5 text-[13px]">
                {consultations.length} total &middot; {filtered.length}{" "}
                ditampilkan
              </p>
            </div>
            <Link
              to="/consultations"
              id="new-consultation-btn"
              className="bg-primary hover:bg-primary-hover flex items-center gap-[8px] rounded-xl px-[13px] py-[8px] text-[14px] font-semibold text-white transition-all duration-150"
            >
              <Plus size={16} strokeWidth={2} />
              Konsultasi Baru
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + cards ─────────────────────────────────────── */}
      <div className="mx-auto max-w-[1152px] px-4 py-[34px] sm:px-6 lg:px-8">
        <div className="flex items-start gap-[34px]">
          {/* ── LEFT: filter sidebar (288px) ──────────────────────────── */}
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          {/* ── RIGHT: card area ──────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid gap-[21px] sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-border/50 h-56 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="bg-error-light flex flex-col items-center rounded-2xl px-8 py-[34px] text-center">
                <AlertTriangle
                  size={32}
                  strokeWidth={1.75}
                  className="text-error mb-3"
                />
                <p className="text-text-primary text-[16px] font-semibold">
                  Gagal memuat konsultasi
                </p>
                <p className="text-text-secondary mt-1 text-[14px]">
                  {error?.message}
                </p>
                <button
                  onClick={refetch}
                  className="bg-primary hover:bg-primary-hover mt-[21px] rounded-xl px-[21px] py-[8px] text-[14px] font-semibold text-white transition"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && filtered.length === 0 && (
              <div
                className="bg-background flex flex-col items-center justify-center rounded-2xl px-8 py-[55px] text-center"
                style={{
                  boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                }}
              >
                <Stethoscope
                  size={48}
                  strokeWidth={1.5}
                  className="text-text-secondary mb-[21px] opacity-30"
                />
                <h3 className="text-text-primary text-[16px] font-semibold">
                  {consultations.length === 0
                    ? "Belum ada konsultasi"
                    : "Tidak ada hasil"}
                </h3>
                <p className="text-text-secondary mt-[5px] text-[14px] leading-[1.55]">
                  {consultations.length === 0
                    ? "Mulai berkonsultasi dengan dokter berlisensi kami."
                    : "Ubah filter untuk menampilkan hasil lain."}
                </p>
                {consultations.length === 0 ? (
                  <Link
                    to="/consultations"
                    className="bg-primary hover:bg-primary-hover mt-[21px] rounded-xl px-[21px] py-[8px] text-[14px] font-semibold text-white transition"
                  >
                    Cari Dokter
                  </Link>
                ) : (
                  <button
                    onClick={handleReset}
                    className="bg-surface text-text-secondary hover:bg-primary-light hover:text-primary mt-[21px] flex items-center gap-[5px] rounded-xl px-[21px] py-[8px] text-[14px] font-semibold transition"
                  >
                    <RotateCcw size={14} strokeWidth={2} />
                    Reset Filter
                  </button>
                )}
              </div>
            )}

            {/* Cards — 2-column grid */}
            {!isLoading && !isError && filtered.length > 0 && (
              <div className="grid gap-[21px] sm:grid-cols-2">
                {filtered.map((c) => (
                  <ConsultationCard key={c.id} consultation={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
