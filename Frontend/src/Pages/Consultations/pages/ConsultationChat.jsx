import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  useConsultationDetail,
  useSendMessage,
  useChatHistory,
} from "../../../hooks/useConsultations";
import { useConsultationChat } from "../../../hooks/useConsultationChat";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../lib/socket";
import { Send, Loader2, Clock, MessageSquare } from "lucide-react";
import { formatDate } from "../helpers/formatters";

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

    socket.on("consultation_accepted", handleAccepted);
    socket.on("consultation_started", handleAccepted);
    socket.on("consultation_session_ended", handleSessionEnded);
    return () => {
      socket.off("consultation_accepted", handleAccepted);
      socket.off("consultation_started", handleAccepted);
      socket.off("consultation_session_ended", handleSessionEnded);
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
          doctor={consult?.doctor}
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
          doctor={consult?.doctor}
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
        doctor={consult?.doctor}
        badge={
          countdown !== null && (
            <span
              className={`ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold tabular-nums ${
                isWarning
                  ? "animate-pulse bg-error-light text-error"
                  : "bg-surface text-text-secondary"
              }`}
              title="Sisa waktu konsultasi"
            >
              <Clock size={11} className="mr-1 inline -mt-0.5" />
              {countdown}
            </span>
          )
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
    </div>
  );
}
