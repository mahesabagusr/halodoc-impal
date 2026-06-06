import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  useMyConsultations,
  useSendMessage,
  useChatHistory,
  useGeneratePrescription,
} from "../../../hooks/useConsultations";
import { useConsultationChat } from "../../../hooks/useConsultationChat";
import { useProducts } from "../../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../lib/socket";
import {
  Bell,
  LogOut,
  Send,
  Loader2,
  MessageSquare,
  Stethoscope,
  Plus,
  Trash,
  X,
  Pill,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── JWT Decode ─────────────────────────────────────────────────────── */
function decodeTokenRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role || null;
  } catch {
    return null;
  }
}

function decodeTokenUserId(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).userId || null;
  } catch {
    return null;
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Chat Bubble ────────────────────────────────────────────────────── */
function ChatBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-[1.55] ${
          isMine
            ? "rounded-2xl rounded-br-[4px] bg-primary-light text-text-primary"
            : "rounded-2xl rounded-bl-[4px] bg-[#F3F4F6] text-text-primary"
        }`}
      >
        <p>{message.content}</p>
        <p className="mt-1 text-[11px] text-right text-text-secondary">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState({ Icon = MessageSquare, title, sub }) {
  const IconComp = Icon;
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      {IconComp && <IconComp size={40} strokeWidth={1.5} className="mb-3 text-text-secondary opacity-40" />}
      <p className="font-medium text-text-primary">{title}</p>
      {sub && <p className="mt-1 text-[14px] text-text-secondary">{sub}</p>}
    </div>
  );
}

function ChatWindow({ consultationId, currentUserId, consultation }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  /* ── Prescription States ─────────────────────────────────────────── */
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescNotes, setPrescNotes] = useState("");
  const [prescItems, setPrescItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrescExpanded, setIsPrescExpanded] = useState(false);

  const queryClient = useQueryClient();

  /* ── Fetch Products for prescription creator ─────────────────────── */
  const { products, isLoading: loadingProducts } = useProducts({
    search: searchQuery,
    limit: 5,
  });

  const generatePrescriptionMutation = useGeneratePrescription(consultationId, {
    onSuccess: () => {
      setIsPrescriptionModalOpen(false);
      setPrescNotes("");
      setPrescItems([]);
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", consultationId] });
    },
    onError: (err) => {
      alert(err?.message || "Gagal membuat resep");
    },
  });

  const { data: historyRaw, isLoading } = useChatHistory(consultationId);
  const history = Array.isArray(historyRaw?.data)
    ? historyRaw.data
    : Array.isArray(historyRaw)
    ? historyRaw
    : [];

  const { messages, isConnected, connectionError } = useConsultationChat(
    consultationId,
    history
  );
  const sendMutation = useSendMessage(consultationId);

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <Loader2 size={28} strokeWidth={2} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Live indicator */}
      <div className="flex items-center justify-end border-b border-border bg-background px-4 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? "animate-pulse bg-success" : "bg-border"
            }`}
          />
          {connectionError ? (
            <span className="text-error">{connectionError}</span>
          ) : isConnected ? (
            "Live"
          ) : (
            "Menghubungkan..."
          )}
        </span>
      </div>

      {/* ── Collapsible Prescription Card ────────────────────────────── */}
      {consultation?.prescription && (
        <div className="border-b border-border bg-pink-50/45 px-6 py-4 shrink-0 transition-all duration-300">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary animate-bounce">
                  <Pill size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">Resep Dokter Tersedia</p>
                  <p className="text-[11px] text-text-secondary">
                    {consultation.prescription.items?.length || 0} obat diresepkan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrescExpanded(!isPrescExpanded)}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-surface transition cursor-pointer"
              >
                {isPrescExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Expanded Item list */}
            {isPrescExpanded && (
              <div className="mt-4 border-t border-border/60 pt-4 animate-in slide-in-from-top-2 duration-200">
                <h4 className="text-[12px] font-bold text-text-primary uppercase tracking-wider mb-2">Daftar Resep Obat</h4>
                <div className="space-y-2.5">
                  {consultation.prescription.items?.map((item) => (
                    <div key={item.id} className="flex items-start justify-between rounded-xl bg-background border border-border/50 p-3">
                      <div>
                        <p className="text-[13px] font-semibold text-text-primary">
                          {item.productId ? item.product?.name : item.customProductName}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Dosage: {item.dosage}</p>
                      </div>
                      <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-bold text-text-secondary">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                {consultation.prescription.notes && (
                  <div className="mt-3.5 rounded-xl bg-background border border-border/50 p-3">
                    <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Catatan Dokter</h5>
                    <p className="text-[13px] text-text-primary mt-1 leading-[1.5]">{consultation.prescription.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <EmptyState
            Icon={MessageSquare}
            title="Belum ada pesan"
            sub="Mulai percakapan dengan pasien"
          />
        )}
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id ?? i}
            message={msg}
            isMine={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-background px-4 py-3">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3"
        >
          {!consultation?.prescription && (
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary hover:text-primary hover:border-primary transition cursor-pointer mb-0.5"
              title="Tambah Resep Obat"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}
          <textarea
            id={`doctor-chat-input-${consultationId}`}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Balas pasien... (Enter untuk kirim)"
            className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary placeholder-text-secondary outline-none transition focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(255,92,138,0.1)]"
          />
          <button
            id={`doctor-send-btn-${consultationId}`}
            type="submit"
            disabled={!input.trim() || sendMutation.isPending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-hover disabled:bg-border disabled:text-[#9CA3AF]"
          >
            {sendMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2} className="translate-x-0.5" />
            )}
          </button>
        </form>
      </div>

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

/* ─── Patient List Item (ONGOING only) ──────────────────────────────── */
function PatientItem({ consultation, isActive, onClick }) {
  const patient = consultation.patient;
  const initials =
    patient?.fullName
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "P";

  return (
    <button
      id={`patient-item-${consultation.id}`}
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left transition-all duration-200 ${
        isActive
          ? "bg-primary-light ring-2 ring-primary/30"
          : "bg-background hover:bg-surface"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-[14px] font-bold text-primary">
          {initials}
          {/* Online dot */}
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-text-primary">
            {patient?.fullName || `Pasien #${consultation.patientId}`}
          </p>
          <p className="text-[11px] text-text-secondary">
            Konsultasi #{consultation.id}
          </p>
        </div>
        {isActive && (
          <span className="shrink-0 text-[14px] text-primary">●</span>
        )}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                        */
/* ══════════════════════════════════════════════════════════════════════ */
export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState(null);

  /* Role resolution */
  const role = user?.role || decodeTokenRole(token);
  const currentUserId = user?.id || decodeTokenUserId(token);

  /* Fetch consultations — only ONGOING for the dashboard */
  const { data: raw, isLoading, isError, error, refetch } = useMyConsultations();
  const allConsultations = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];

  const ongoingConsultations = allConsultations.filter(
    (c) => c.status === "ONGOING"
  );
  const activeConsult = ongoingConsultations.find((c) => c.id === activeId);

  /* ── Auth guard ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user && !token) {
      navigate("/auth", { replace: true });
      return;
    }
    if (role && role !== "DOCTOR") {
      navigate("/", { replace: true });
    }
  }, [user, token, role, navigate]);

  /* ── Real-time: listen for new requests & accepted consultations ── */
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleNewRequest = () => {
      // Refresh list when a new request comes in
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
    };

    socket.on("new_consultation_request", handleNewRequest);
    socket.on("consultation_started", () => {
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
    });

    return () => {
      socket.off("new_consultation_request", handleNewRequest);
    };
  }, [token, queryClient]);

  /* ── Loading / role resolving ────────────────────────────────────── */
  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Loader2 size={28} strokeWidth={2} className="animate-spin text-primary" />
      </div>
    );
  }

  /* ── Pending requests count (for badge) ─────────────────────────── */
  const pendingCount = allConsultations.filter(
    (c) => c.status === "REQUESTED"
  ).length;

  return (
    /* Full-screen, no navbar/footer */
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      {/* ══ TOP HEADER ═══════════════════════════════════════════════ */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-5 py-3">
        {/* Brand + doctor info */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[14px] font-bold text-white">
            Dr
          </div>
          <div>
            <h1 className="text-[14px] font-semibold leading-none text-text-primary">
              Dashboard Dokter
            </h1>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              {user?.fullName || user?.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Request notifications button */}
          <button
            id="view-requests-btn"
            onClick={() => navigate("/doctor/requests")}
            className="relative flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-text-secondary transition hover:bg-surface"
          >
            <Bell size={14} strokeWidth={2} />
            Permintaan
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            id="doctor-logout-btn"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-error/20 bg-error-light px-3 py-1.5 text-[13px] font-semibold text-error transition hover:bg-error/10"
          >
            <LogOut size={14} strokeWidth={2} />
            Keluar
          </button>
        </div>
      </header>

      {/* ══ BODY ═════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR: Active Patient List ───────────────────── */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              Sesi Aktif
            </h2>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              {ongoingConsultations.length} pasien sedang dalam konsultasi
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-surface"
                  />
                ))}
              </div>
            )}
            {isError && (
              <div className="rounded-xl bg-error-light p-4 text-center">
                <p className="text-[13px] text-error">
                  {error?.message || "Gagal memuat"}
                </p>
                <button
                  onClick={refetch}
                  className="mt-2 text-[13px] font-semibold text-error underline"
                >
                  Coba lagi
                </button>
              </div>
            )}
            {!isLoading && !isError && ongoingConsultations.length === 0 && (
              <EmptyState
                Icon={Stethoscope}
                title="Tidak ada sesi aktif"
                sub="Terima permintaan pasien terlebih dahulu"
              />
            )}
            {ongoingConsultations.map((c) => (
              <PatientItem
                key={c.id}
                consultation={c}
                isActive={activeId === c.id}
                onClick={() => setActiveId(c.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── RIGHT PANEL: Chat Area ───────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!activeConsult ? (
            <EmptyState
              Icon={MessageSquare}
              title="Pilih pasien untuk memulai chat"
              sub="Daftar sesi aktif ada di panel kiri"
            />
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-4 border-b border-border bg-background px-6 py-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-[14px] font-bold text-primary">
                  {activeConsult.patient?.fullName?.[0]?.toUpperCase() || "P"}
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-semibold text-text-primary">
                    {activeConsult.patient?.fullName ||
                      `Pasien #${activeConsult.patientId}`}
                  </p>
                  <p className="text-[13px] font-medium text-primary">
                    Konsultasi #{activeConsult.id} · Sedang berlangsung
                  </p>
                </div>
              </div>

              {/* Chat body */}
              <ChatWindow
                key={activeConsult.id}
                consultationId={activeConsult.id}
                currentUserId={currentUserId}
                consultation={activeConsult}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
