import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  useConsultationDetail,
  useSendMessage,
  useChatHistory,
  useGeneratePrescription,
} from "../../../hooks/useConsultations";
import { useConsultationChat } from "../../../hooks/useConsultationChat";
import { useProducts } from "../../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../lib/socket";
import {
  Send,
  Loader2,
  Clock,
  MessageSquare,
  Pill,
  Printer,
  Plus,
  Trash,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate, printInvoice } from "../helpers/formatters";

import ChatBubble from "../components/ChatBubble";
import ChatHeader from "../components/ChatHeader";
import WaitingScreen from "../components/WaitingScreen";
import StatusScreen from "../components/StatusScreen";

/* ─── Session countdown hook ─────────────────────────────────────────── */
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function useSessionCountdown(startTime) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const tick = () => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, SESSION_DURATION_MS - elapsed);
      setRemaining(left);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return remaining;
}

function formatCountdown(ms) {
  if (ms === null) return null;
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  MAIN CHAT PAGE                                                         */
/* ══════════════════════════════════════════════════════════════════════ */
export default function ConsultationChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  /* ── Prescription States ─────────────────────────────────────────── */
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescNotes, setPrescNotes] = useState("");
  const [prescItems, setPrescItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrescExpanded, setIsPrescExpanded] = useState(false);

  /* ── Data fetching ────────────────────────────────────────────────── */
  const { data: consultRaw, isLoading: loadingConsult } =
    useConsultationDetail(id);
  const { data: historyRaw, isLoading: loadingHistory } = useChatHistory(id);

  const consult = consultRaw?.data || consultRaw;
  const history = Array.isArray(historyRaw?.data)
    ? historyRaw.data
    : Array.isArray(historyRaw)
    ? historyRaw
    : [];

  /* ── Fetch Products for prescription creator ─────────────────────── */
  const { products, isLoading: loadingProducts } = useProducts({
    search: searchQuery,
    limit: 5,
  });

  /* ── Create prescription mutation ────────────────────────────────── */
  const generatePrescriptionMutation = useGeneratePrescription(id, {
    onSuccess: () => {
      setIsPrescriptionModalOpen(false);
      setPrescNotes("");
      setPrescItems([]);
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    },
    onError: (err) => {
      alert(err?.message || "Gagal membuat resep");
    },
  });

  /* ── 30-minute session countdown ─────────────────────────────────── */
  const startTime = consult?.status === "ONGOING" ? consult?.startTime : null;
  const remainingMs = useSessionCountdown(startTime);
  const countdown = formatCountdown(remainingMs);
  const isWarning = remainingMs !== null && remainingMs < 5 * 60 * 1000;

  /* ── Socket: real-time messages (only when ONGOING) ──────────────── */
  const { messages, isConnected, connectionError } = useConsultationChat(
    consult?.status === "ONGOING" ? id : null,
    history
  );

  /* ── Send message mutation ────────────────────────────────────────── */
  const sendMutation = useSendMessage(id);

  /* ── Decoded Chat Partner info ───────────────────────────────────── */
  const chatPartner = user?.role === "DOCTOR"
    ? { fullName: consult?.patient?.fullName, specialization: "Pasien" }
    : {
        fullName: consult?.doctor?.fullName,
        specialization: consult?.doctor?.doctorProfile?.specialization?.name,
      };

  /* ── Redirect: no payment → payment page ─────────────────────────── */
  useEffect(() => {
    if (!loadingConsult && consult && consult.paymentStatus === "PENDING") {
      navigate(`/consultations/${id}/payment`, { replace: true });
    }
  }, [consult, loadingConsult, id, navigate]);

  /* ── Poll status when REQUESTED + PAID (waiting for doctor) ─────── */
  useEffect(() => {
    if (!consult) return;
    if (consult.status !== "REQUESTED" || consult.paymentStatus !== "PAID") return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
    }, 10000);

    return () => clearInterval(interval);
  }, [consult, id, queryClient]);

  /* ── Fallback: force-refresh when countdown hits 0 ───────────────── */
  useEffect(() => {
    if (remainingMs !== 0) return;
    const t = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    }, 2000);
    return () => clearTimeout(t);
  }, [remainingMs, id, queryClient]);

  /* ── Socket: listen for consultation_accepted event ─────────────── */
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleAccepted = () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    };

    const handleSessionEnded = () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    };

    const handlePrescriptionReady = () => {
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
    };

    socket.on("consultation_accepted", handleAccepted);
    socket.on("consultation_started", handleAccepted);
    socket.on("consultation_session_ended", handleSessionEnded);
    socket.on("prescription_ready", handlePrescriptionReady);
    return () => {
      socket.off("consultation_accepted", handleAccepted);
      socket.off("consultation_started", handleAccepted);
      socket.off("consultation_session_ended", handleSessionEnded);
      socket.off("prescription_ready", handlePrescriptionReady);
    };
  }, [token, id, queryClient]);

  /* ── Auto-scroll ──────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate({ content: trimmed });
  };

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (loadingConsult || loadingHistory) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} strokeWidth={2} className="animate-spin text-primary" />
          <p className="text-[14px] text-text-secondary">Memuat sesi konsultasi...</p>
        </div>
      </div>
    );
  }

  /* ── Waiting for doctor to accept ────────────────────────────────── */
  if (consult?.status === "REQUESTED" && consult?.paymentStatus === "PAID") {
    return (
      <div className="flex h-screen flex-col bg-surface">
        <ChatHeader
          doctor={chatPartner}
          badge={
            <span className="ml-auto rounded-full bg-warning-light px-2.5 py-0.5 text-[11px] font-semibold text-warning">
              Menunggu
            </span>
          }
        />
        <WaitingScreen consultationId={id} />
      </div>
    );
  }

  /* ── Completed / Cancelled ────────────────────────────────────────── */
  if (
    consult &&
    (consult.status === "COMPLETED" || consult.status === "CANCELLED")
  ) {
    return (
      <div className="flex h-screen flex-col bg-surface">
        <ChatHeader
          doctor={chatPartner}
          badge={
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                consult.status === "COMPLETED"
                  ? "bg-success-light text-success"
                  : "bg-error-light text-error"
              }`}
            >
              {consult.status === "COMPLETED" ? "Selesai" : "Dibatalkan"}
            </span>
          }
        />

        {/* Still allow reading history for completed/cancelled */}
        {history.length > 0 ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-4">
              {history.map((msg, i) => (
                <ChatBubble
                  key={msg.id ?? i}
                  message={msg}
                  isMine={msg.senderId === user?.id}
                />
              ))}
            </div>
            <div className="border-t border-border bg-surface p-4 text-center text-[11px] text-text-secondary">
              Riwayat chat — konsultasi telah{" "}
              {consult.status === "COMPLETED" ? "selesai" : "dibatalkan"}
            </div>
          </div>
        ) : (
          <StatusScreen status={consult.status} />
        )}
      </div>
    );
  }

  /* ── ONGOING: Main Chat UI ────────────────────────────────────────── */
  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Header */}
      <ChatHeader
        backBtnId="chat-back-btn"
        doctor={chatPartner}
        badge={
          <div className="flex items-center gap-2 ml-auto">
            {countdown !== null && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold tabular-nums ${
                  isWarning
                    ? "animate-pulse bg-error-light text-error"
                    : "bg-surface text-text-secondary"
                }`}
                title="Sisa waktu konsultasi"
              >
                <Clock size={11} className="mr-1 inline -mt-0.5" />
                {countdown}
              </span>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Sedang Berlangsung
          </span>
          {/* Socket status */}
          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? "animate-pulse bg-success" : "bg-border"
              }`}
            />
            {connectionError
              ? "Koneksi gagal"
              : isConnected
              ? "Live"
              : "Menghubungkan..."}
          </span>
        </div>
      </ChatHeader>

      {/* Prescription Banner */}
      {consult?.prescription && (
        <div className="border-b border-border bg-[#FFF5F7] px-4 py-3 shrink-0">
          <div className="mx-auto flex max-w-[720px] items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
                <Pill size={14} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Resep Dokter Tersedia</p>
                <p className="text-[11px] text-text-secondary">
                  {consult.prescription.items?.length || 0} obat diresepkan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === "PATIENT" && (
                <button
                  onClick={() => printInvoice(consult)}
                  className="flex items-center gap-1 rounded-lg border border-primary/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary-light transition cursor-pointer"
                >
                  <Printer size={12} />
                  Cetak PDF
                </button>
              )}
              <button
                onClick={() => setIsPrescExpanded(!isPrescExpanded)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 text-text-secondary transition cursor-pointer"
              >
                {isPrescExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Expanded prescription items */}
          {isPrescExpanded && (
            <div className="mx-auto mt-3 max-w-[720px] rounded-xl border border-border bg-background p-4 shadow-sm">
              <h4 className="text-[12px] font-bold text-text-primary uppercase tracking-wider mb-2">Daftar Resep Obat</h4>
              <div className="space-y-3 divide-y divide-border/40">
                {consult.prescription.items?.map((item, idx) => (
                  <div key={item.id ?? idx} className="pt-3 first:pt-0 flex justify-between items-start">
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary">
                        {item.product?.name || item.customProductName || "Obat"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-primary bg-primary-light inline-block px-2 py-0.5 rounded-full font-medium">
                        Aturan Pakai: {item.dosage}
                      </p>
                    </div>
                    <span className="text-[12px] font-medium text-text-secondary">Jumlah: {item.quantity}</span>
                  </div>
                ))}
              </div>
              
              {consult.prescription.notes && (
                <div className="mt-4 border-t border-border/40 pt-3">
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Catatan Dokter</p>
                  <p className="mt-1 text-[12px] text-text-primary leading-relaxed whitespace-pre-wrap">
                    {consult.prescription.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages — constrained to 720px for readability */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-[720px]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare size={40} strokeWidth={1.5} className="mb-3 text-text-secondary opacity-40" />
              <p className="text-[14px] font-medium text-text-primary">Belum ada pesan</p>
              <p className="mt-1 text-[13px] text-text-secondary">
                Mulai percakapan dengan dokter Anda
              </p>
            </div>
          )}
          {messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showDate =
              !prevMsg ||
              formatDate(msg.timestamp) !== formatDate(prevMsg?.timestamp);
            return (
              <div key={msg.id ?? i}>
                {showDate && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[11px] font-medium text-text-secondary">
                      {formatDate(msg.timestamp)}
                    </span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                )}
                <ChatBubble
                  message={msg}
                  isMine={msg.senderId === user?.id}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      <footer className="border-t border-border bg-background px-4 py-3">
        {connectionError && (
          <p className="mb-2 text-center text-[11px] text-error">
            {connectionError} — pesan mungkin tidak terkirim secara real-time
          </p>
        )}
        <form onSubmit={handleSend} className="mx-auto flex max-w-[720px] items-end gap-3">
          {user?.role === "DOCTOR" && !consult?.prescription && (
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary hover:text-primary hover:border-primary transition cursor-pointer"
              title="Tambah Resep Obat"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tuliskan gejala yang Anda rasakan..."
            className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[14px] text-text-primary placeholder-text-secondary outline-none transition focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(255,92,138,0.1)]"
          />
          <button
            id="send-message-btn"
            type="submit"
            disabled={!input.trim() || sendMutation.isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-hover disabled:bg-border disabled:text-[#9CA3AF]"
          >
            {sendMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2} className="translate-x-0.5" />
            )}
          </button>
        </form>
      </footer>

      {/* ── Prescription Creator Modal ────────────────────────────────── */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative flex h-full max-h-[550px] w-full max-w-[500px] flex-col rounded-3xl bg-background shadow-2xl border border-border/40 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Pill className="text-primary animate-pulse" size={18} />
                <h3 className="text-[16px] font-bold text-text-primary">Buat Resep Obat</h3>
              </div>
              <button
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="rounded-full p-1.5 text-text-secondary hover:bg-surface transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Product search box */}
              <div className="relative">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Cari Obat</label>
                <input
                  type="text"
                  placeholder="Ketik nama obat (misal: paracetamol)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] outline-none transition focus:border-primary focus:bg-background"
                />
                
                {/* Search results */}
                {searchQuery.trim() && (
                  <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-[180px] overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
                    {loadingProducts ? (
                      <div className="p-4 text-center text-[12px] text-text-secondary">Mencari...</div>
                    ) : (
                      <>
                        {products.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              if (!prescItems.some(item => item.productId === prod.id)) {
                                setPrescItems([...prescItems, {
                                  product: prod,
                                  productId: prod.id,
                                  dosage: "2x sehari",
                                  quantity: 1
                                }]);
                              }
                              setSearchQuery("");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] hover:bg-surface border-b border-border/45 last:border-0 cursor-pointer"
                          >
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.name} className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-secondary">
                                <Pill size={14} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-text-primary">{prod.name}</p>
                              <p className="text-[11px] text-text-secondary">Stok: {prod.stock} • Rp {prod.price.toLocaleString("id-ID")}</p>
                            </div>
                            <Plus size={14} className="text-primary shrink-0" />
                          </button>
                        ))}
                        {/* Custom medicine creation option */}
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = searchQuery.trim();
                            if (trimmed && !prescItems.some(item => item.customProductName === trimmed)) {
                              setPrescItems([...prescItems, {
                                product: { name: trimmed, price: 0, stock: 999 },
                                productId: null,
                                customProductName: trimmed,
                                dosage: "2x sehari",
                                quantity: 1
                              }]);
                            }
                            setSearchQuery("");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] hover:bg-surface text-primary border-t border-border/45 cursor-pointer font-medium"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
                            <Plus size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-primary font-semibold">Gunakan "{searchQuery.trim()}"</p>
                            <p className="text-[11px] text-text-secondary">Tambahkan sebagai obat kustom</p>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Added prescription items list */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Daftar Resep ({prescItems.length})
                </label>
                {prescItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-[13px] text-text-secondary bg-surface/10">
                    Belum ada obat yang ditambahkan. Cari obat di atas untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescItems.map((item, index) => (
                      <div key={item.productId ?? `custom-${index}`} className="flex flex-col gap-2 rounded-2xl border border-border p-3.5 bg-surface/30">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-text-primary truncate">
                              {item.productId ? item.product.name : item.customProductName}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {item.productId ? `Stok: ${item.product.stock}` : "Obat Kustom (Bebas)"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPrescItems(prescItems.filter((_, i) => i !== index));
                            }}
                            className="rounded-full p-1 text-text-secondary hover:bg-error-light hover:text-error transition cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                          {/* Dosage Input */}
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Cth: 2x sehari"
                              value={item.dosage}
                              onChange={(e) => {
                                const copy = [...prescItems];
                                copy[index].dosage = e.target.value;
                                setPrescItems(copy);
                              }}
                              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] outline-none focus:border-primary"
                            />
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...prescItems];
                                copy[index].quantity = Math.max(1, copy[index].quantity - 1);
                                setPrescItems(copy);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-[14px] hover:bg-surface font-semibold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-[13px] font-medium text-text-primary">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...prescItems];
                                copy[index].quantity = item.productId
                                  ? Math.min(item.product.stock, copy[index].quantity + 1)
                                  : copy[index].quantity + 1;
                                setPrescItems(copy);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-[14px] hover:bg-surface font-semibold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* General notes */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Catatan Dokter</label>
                <textarea
                  placeholder="Petunjuk penggunaan umum atau saran medis lainnya..."
                  rows={2}
                  value={prescNotes}
                  onChange={(e) => setPrescNotes(e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] outline-none transition focus:border-primary focus:bg-background"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border px-5 py-4 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="flex-1 rounded-xl border border-border bg-background py-2 text-[13px] font-semibold text-text-secondary hover:bg-surface transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={prescItems.length === 0 || generatePrescriptionMutation.isPending}
                onClick={() => {
                  generatePrescriptionMutation.mutate({
                    notes: prescNotes,
                    items: prescItems.map(i => ({
                      productId: i.productId,
                      customProductName: i.customProductName,
                      dosage: i.dosage,
                      quantity: i.quantity
                    }))
                  });
                }}
                className="flex-1 rounded-xl bg-primary py-2 text-[13px] font-semibold text-white hover:bg-primary-hover transition disabled:bg-border disabled:text-text-secondary cursor-pointer"
              >
                {generatePrescriptionMutation.isPending ? "Mengirim..." : "Kirim Resep"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
