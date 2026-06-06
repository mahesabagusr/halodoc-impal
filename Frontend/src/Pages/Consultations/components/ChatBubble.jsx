import { formatTime } from "../helpers/formatters";

/**
 * Chat bubble untuk pesan konsultasi.
 * Digunakan di ConsultationChat (ONGOING dan riwayat COMPLETED/CANCELLED).
 */
export default function ChatBubble({ message, isMine }) {
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
