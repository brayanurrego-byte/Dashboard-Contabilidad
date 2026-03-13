import { STATUS_LABELS, STATUS_COLORS } from "../../lib/parseColors";

export function Badge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || "Desconocido";

  return (
    <span
      className="badge"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: colors.text }}
      />
      {label}
    </span>
  );
}
