import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserRound, Clock } from "lucide-react";

/**
 * Reusable chat-page header with doctor profile and status badge.
 * Used in all 3 ConsultationChat states: waiting, completed/cancelled, ongoing.
 *
 * @param {object}  props
 * @param {object}  props.doctor          - { fullName, specialization }
 * @param {React.ReactNode} props.badge   - Status badge element (right side)
 * @param {React.ReactNode} [props.children] - Extra content below the doctor name (e.g. live badge, countdown)
 * @param {string}  [props.backBtnId]     - HTML id for the back button
 */
export default function ChatHeader({ doctor, badge, children, backBtnId }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
      <button
        id={backBtnId}
        onClick={() => navigate("/history")}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light">
        <UserRound size={16} strokeWidth={2} className="text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-text-primary">
          {doctor?.fullName || "Dokter"}
        </p>
        {doctor?.specialization && (
          <p className="text-[11px] text-text-secondary">
            {doctor.specialization}
          </p>
        )}
        {children}
      </div>

      {badge}
    </header>
  );
}
