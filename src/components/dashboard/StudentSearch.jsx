import { useState, useCallback } from "react";
import { Search, User, FileText, Hash, X, AlertTriangle, DollarSign } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useStudentSearch } from "../../hooks/useStudentSearch";
import { debounce } from "../../lib/utils";

function getReqStyle(status) {
  if (status === "ok") return { bg: "rgba(0,255,136,0.1)", color: "#00ff88", border: "rgba(0,255,136,0.2)", icon: "✓" };
  if (status === "na") return { bg: "rgba(0,255,136,0.07)", color: "#66ddaa", border: "rgba(0,255,136,0.15)", icon: "—" };
  return { bg: "rgba(255,71,87,0.1)", color: "#ff4757", border: "rgba(255,71,87,0.2)", icon: "✗" };
}

function getReqLabel(status) {
  if (status === "na") return "N/A";
  if (status === "ok") return "";
  return "Pendiente";
}

function StudentDetail({ student, onClose }) {
  const fields = [
    { label: "Nombre completo", value: student.nombreCompleto, icon: User },
    { label: "Cédula", value: student.cedula, icon: Hash },
    { label: "Programa", value: student.programa, icon: FileText },
    { label: "Género", value: student.genero },
    { label: "Ciudad", value: student.ciudad },
    { label: "Celular", value: student.celular },
    { label: "Correo", value: student.correo },
    { label: "Empleo", value: student.empleo },
  ];

  const reqLabels = {
    CEDULA: "Cédula",
    "SABER 11": "Saber 11",
    "ACTA DE GRADO": "Acta de Grado",
    "SABER TYT": "Saber TyT",
    "SABER PRO": "Saber Pro",
    ASIGNATURAS: "Asignaturas",
    "REQUISITO B2": "Requisito B2",
    CARTERA: "Cartera",
  };

  const pendingItems = Object.entries(student.requirements).filter(([, s]) => s === "pending");
  const hasConditionalNote = student.notasCondicionales && student.notasCondicionales !== "—" && student.notasCondicionales !== "";
  const hasCarteraValue = student.carteraRaw && student.carteraRaw !== "" && student.carteraRaw !== "—" && student.carteraRaw !== "0"
    && !["ok", "cumple", "si", "sí", "paz y salvo", "al dia", "al día", "n/a"].includes(student.carteraRaw.toLowerCase());

  return (
    <Card className="glass-strong border-accent-cyan/20 animate-fade-up relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
          <User className="w-5 h-5 text-accent-cyan" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-white">{student.nombreCompleto}</h3>
          <p className="text-sm text-gray-400">CC {student.cedula}</p>
        </div>
        <div className="ml-auto">
          <Badge status={student.status} />
        </div>
      </div>

      {/* Cartera (deuda) highlight */}
      {hasCarteraValue && (
        <div className="mb-4 px-3 py-2 rounded-lg border"
          style={{ background: "rgba(255,159,67,0.08)", borderColor: "rgba(255,159,67,0.25)" }}>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" style={{ color: "#ff9f43" }} />
            <span className="text-sm font-medium" style={{ color: "#ff9f43" }}>
              Cartera: {student.carteraRaw}
            </span>
          </div>
        </div>
      )}

      {/* Conditional notes */}
      {hasConditionalNote && (
        <div className="mb-4 px-3 py-2 rounded-lg border"
          style={{ background: "rgba(255,200,0,0.06)", borderColor: "rgba(255,200,0,0.2)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ffc800" }} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: "#ffc800" }}>
                Nota condicional
              </p>
              <p className="text-sm text-gray-200">{student.notasCondicionales}</p>
              {student.notasExtra && student.notasExtra !== "" && student.notasExtra !== "—" && (
                <p className="text-sm text-gray-300 mt-0.5">{student.notasExtra}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="text-sm">
            <span className="text-gray-500 text-xs">{label}</span>
            <p className="text-gray-200 truncate">{value || "—"}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Avance: {student.completedReqs}/{student.totalReqs}
          </p>
          <span className="text-xs font-bold" style={{
            color: student.completionPct === 100 ? "#00ff88" : student.completionPct >= 75 ? "#ff9f43" : "#ff4757"
          }}>
            {Math.round(student.completionPct)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${student.completionPct}%`,
            background: student.completionPct === 100 ? "#00ff88" : student.completionPct >= 75 ? "#ff9f43" : "#ff4757",
          }} />
        </div>
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Requisitos ({student.completedReqs}/{student.totalReqs})
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(student.requirements).map(([key, status]) => {
            const style = getReqStyle(status);
            const extra = getReqLabel(status);
            return (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  background: style.bg,
                  color: style.color,
                  border: `1px solid ${style.border}`,
                }}
              >
                {style.icon} {reqLabels[key] || key}{extra ? ` (${extra})` : ""}
              </span>
            );
          })}
        </div>

        {/* Pending items summary */}
        {pendingItems.length > 0 && (
          <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#ff4757" }}>
              Pendientes ({pendingItems.length}):
            </p>
            <ul className="text-xs text-gray-300 space-y-0.5">
              {pendingItems.map(([key]) => (
                <li key={key}>
                  — {reqLabels[key] || key}: <span style={{ color: "#ff4757" }}>
                    {student.requirementRawValues?.[key] || "Sin información"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export function StudentSearch({ students }) {
  const { query, searchType, setSearchType, results, handleSearch, clearSearch } = useStudentSearch(students);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const debouncedSearch = useCallback(debounce((v) => handleSearch(v), 300), [handleSearch]);

  const [inputValue, setInputValue] = useState("");

  const onInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    debouncedSearch(v);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-accent-cyan" />
        <h2 className="font-heading font-bold text-xl text-white">Buscar Estudiante</h2>
      </div>

      <Card hover={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 shrink-0">
            <button
              onClick={() => setSearchType("nombre")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                searchType === "nombre"
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Nombre
            </button>
            <button
              onClick={() => setSearchType("cedula")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                searchType === "cedula"
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Cédula
            </button>
          </div>

          {/* Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={onInputChange}
              placeholder={searchType === "nombre" ? "Escriba nombre o apellido..." : "Escriba número de cédula..."}
              className="search-input pl-10 pr-10"
            />
            {inputValue && (
              <button
                onClick={() => { setInputValue(""); clearSearch(); setSelectedStudent(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && !selectedStudent && (
          <div className="mt-4 space-y-1.5 max-h-64 overflow-y-auto">
            {results.slice(0, 20).map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedStudent(s)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{s.nombreCompleto}</p>
                  <p className="text-xs text-gray-500">CC {s.cedula} — {s.programa}</p>
                </div>
                <Badge status={s.status} />
              </button>
            ))}
            {results.length > 20 && (
              <p className="text-xs text-gray-500 text-center py-2">
                {results.length - 20} resultados más...
              </p>
            )}
          </div>
        )}

        {query && query.length >= 2 && results.length === 0 && (
          <p className="mt-4 text-sm text-gray-500 text-center py-4">
            No se encontraron estudiantes.
          </p>
        )}
      </Card>

      {/* Selected student detail */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
