/**
 * Parse Google Sheets row background colors to student status.
 *
 * The Google Apps Script returns a `_backgroundColor` field per row.
 * Google Sheets stores colors as hex strings like "#ff9900", "#93c47d", "#ffffff".
 *
 * Color mapping (configurado por ESUMER):
 *   Naranja → "authorized" (Tiene autorización de pago)
 *   Verde   → "ready"      (Listo para graduación)
 *   Sin color / otros → "pending" (Le falta algo financiero o académico)
 */

/** Convert hex to HSL for better range matching */
function hexToHSL(hex) {
  if (!hex || hex === "#ffffff" || hex === "#FFFFFF") return null;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;

  return { h: hue * 360, s, l };
}

/**
 * Determine student status from row background color.
 * Returns "ready" | "authorized" | "pending"
 */
export function statusFromColor(bgColor) {
  if (!bgColor || bgColor === "#ffffff" || bgColor === "#FFFFFF") {
    return "pending";
  }

  const hsl = hexToHSL(bgColor);
  if (!hsl) return "pending";

  // Green range: hue 80-160° → Listo para graduación
  if (hsl.h >= 80 && hsl.h <= 160 && hsl.s > 0.2) {
    return "ready";
  }

  // Orange range: hue 15-50° → Autorización de pago
  if (hsl.h >= 15 && hsl.h <= 50 && hsl.s > 0.3) {
    return "authorized";
  }

  // Yellow-orange range: hue 40-60° (some oranges lean yellow in Sheets)
  if (hsl.h >= 40 && hsl.h <= 60 && hsl.s > 0.4) {
    return "authorized";
  }

  return "pending";
}

/** Labels for each status */
export const STATUS_LABELS = {
  ready: "Listo para graduación",
  authorized: "Autorización de pago",
  pending: "Pendiente (falta financiero o académico)",
};

/** Color tokens for each status */
export const STATUS_COLORS = {
  ready: { bg: "rgba(0,255,136,0.12)", text: "#00ff88", border: "rgba(0,255,136,0.3)" },
  authorized: { bg: "rgba(255,159,67,0.12)", text: "#ff9f43", border: "rgba(255,159,67,0.3)" },
  pending: { bg: "rgba(255,71,87,0.12)", text: "#ff4757", border: "rgba(255,71,87,0.3)" },
};
