import { useState, useEffect, useCallback, useRef } from "react";
import { statusFromColor } from "../lib/parseColors";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbz1jI2BoQUYzIpiUdsT11QnjZ9jNt1TJ9SFU1JCxMK7mFRwod8_cm3gN5ZXU8nGL6GGCA/exec";

const REFRESH_MS = 30_000;

/** Find header key using partial matching */
function findHeader(headers, ...candidates) {
  for (const c of candidates) {
    const found = headers.find((h) =>
      h.toLowerCase().includes(c.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

/** Normalize a row into a structured student object */
function normalizeRow(row, headers) {
  const hPrograma = findHeader(headers, "Programa");
  const hNombre1 = findHeader(headers, "Primer Nombre");
  const hNombre2 = findHeader(headers, "Segundo Nombre");
  const hApellido1 = findHeader(headers, "Primer Apellido");
  const hApellido2 = findHeader(headers, "Segundo Apellido");
  const hCedula = findHeader(headers, "Documento", "Cédula", "Cedula");
  const hGenero = findHeader(headers, "Género", "Genero");
  const hCiudad = findHeader(headers, "Ciudad de Residencia", "Ciudad");
  const hCelular = findHeader(headers, "Celular");
  const hCorreo = findHeader(headers, "Correo");
  const hTimestamp = findHeader(headers, "Columna 1");
  const hCartera = findHeader(headers, "Cartera", "cartera");
  const hEmpleo = findHeader(headers, "Información Profesional", "Empleo");

  const reqKeys = ["CEDULA", "SABER 11", "ACTA DE GRADO", "SABER TYT", "SABER PRO", "ASIGNATURAS", "REQUISITO B2", "CARTERA"];
  const requirements = {};
  for (const rk of reqKeys) {
    const hk = findHeader(headers, rk);
    if (hk) {
      const v = String(row[hk] || "").toLowerCase().trim();
      requirements[rk] = ["cumple", "si", "sí", "ok", "x", "✓", "✔", "listo"].some((w) => v.includes(w));
    } else {
      requirements[rk] = false;
    }
  }

  const completedReqs = Object.values(requirements).filter(Boolean).length;
  const totalReqs = reqKeys.length;

  const nombre = [row[hNombre1], row[hNombre2]].filter(Boolean).join(" ");
  const apellido = [row[hApellido1], row[hApellido2]].filter(Boolean).join(" ");

  return {
    nombre: nombre || "—",
    apellido: apellido || "—",
    nombreCompleto: `${nombre} ${apellido}`.trim() || "—",
    cedula: row[hCedula] || "—",
    programa: row[hPrograma] || "Sin programa",
    genero: row[hGenero] || "—",
    ciudad: row[hCiudad] || "—",
    celular: row[hCelular] || "—",
    correo: row[hCorreo] || "—",
    timestamp: row[hTimestamp] || null,
    cartera: row[hCartera] || "—",
    empleo: row[hEmpleo] || "—",
    requirements,
    completedReqs,
    totalReqs,
    completionPct: totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0,
    status: row._backgroundColor ? statusFromColor(row._backgroundColor) : (completedReqs === totalReqs ? "ready" : completedReqs >= 6 ? "authorized" : "pending"),
    rawColor: row._backgroundColor || null,
    _raw: row,
  };
}

export function useGoogleSheets() {
  const [students, setStudents] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const res = await fetch(`${API_URL}?t=${Date.now()}`, {
        redirect: "follow",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("La API no devolvió JSON válido. Verifica que el Google Apps Script esté desplegado correctamente.");
      }

      if (json.success && json.rows) {
        const hdrs = json.headers || [];
        setHeaders(hdrs);
        const normalized = json.rows.map((r) => normalizeRow(r, hdrs));
        setStudents(normalized);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(json.error || "Formato de respuesta inválido.");
      }
    } catch (err) {
      const msg =
        err.message.includes("Failed to fetch") || err.message.includes("NetworkError")
          ? "Error de red: verifica tu conexión a internet."
          : err.message;
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const forceRefresh = useCallback(() => fetchData(true), [fetchData]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  return { students, headers, loading, error, lastUpdate, refreshing, forceRefresh };
}
