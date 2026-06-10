/**
 * Badge status generik — menampilkan value sebagai rounded-full badge
 * dengan warna dari styleMap.
 *
 * @param {string} value    - Status value (e.g. "REQUESTED", "PAID")
 * @param {object} styleMap - { [value]: "bg-... text-..." }
 */

export default function StatusBadge({ value, styleMap }) {
  const cls = styleMap[value] ?? "bg-surface text-text-secondary";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {value}
    </span>
  );
}
