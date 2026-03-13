/** Format number with thousands separator */
export function formatNumber(n) {
  return new Intl.NumberFormat("es-CO").format(n);
}

/** Format percentage */
export function formatPct(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`;
}

/** Debounce a function */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Classify program as Pregrado or Posgrado */
export function classifyProgram(program) {
  if (!program) return "Otro";
  const lower = program.toLowerCase();
  if (
    lower.includes("especialización") ||
    lower.includes("especializacion") ||
    lower.includes("maestría") ||
    lower.includes("maestria") ||
    lower.includes("mba") ||
    lower.includes("doctorado") ||
    lower.includes("posgrado")
  ) {
    return "Posgrado";
  }
  return "Pregrado";
}

/** Time ago helper */
export function timeAgo(date) {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours}h`;
}

/** Simple fuzzy match */
export function fuzzyMatch(text, query) {
  if (!text || !query) return false;
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return t.includes(q);
}

/** Highlight matching text */
export function highlightText(text, query) {
  if (!query || !text) return text;
  const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const regex = new RegExp(`(${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const parts = normalizedText.split(regex);

  let pos = 0;
  return parts.map((part, i) => {
    const original = text.substring(pos, pos + part.length);
    pos += part.length;
    if (regex.test(part)) {
      return { text: original, highlight: true, key: i };
    }
    return { text: original, highlight: false, key: i };
  });
}

/** Export data to CSV and trigger download */
export function exportToCSV(rows, headers, filename = "estudiantes.csv") {
  const csvHeaders = headers.join(",");
  const csvRows = rows.map((row) =>
    headers.map((h) => {
      const val = String(row[h] || "").replace(/"/g, '""');
      return `"${val}"`;
    }).join(",")
  );
  const csv = [csvHeaders, ...csvRows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
