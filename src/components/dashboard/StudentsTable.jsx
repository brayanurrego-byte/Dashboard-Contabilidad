import { useState, useMemo } from "react";
import { Table2, Download, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { exportToCSV, classifyProgram } from "../../lib/utils";

const PAGE_SIZE = 25;

export function StudentsTable({ students, headers }) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const programs = useMemo(() => {
    const set = new Set(students.map((s) => s.programa));
    return [...set].sort();
  }, [students]);

  const filtered = useMemo(() => {
    let list = [...students];
    if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
    if (programFilter !== "all") list = list.filter((s) => s.programa === programFilter);
    if (levelFilter !== "all") list = list.filter((s) => classifyProgram(s.programa) === levelFilter);

    if (sortKey) {
      list.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), "es", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [students, statusFilter, programFilter, levelFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const handleExport = () => {
    const exportHeaders = ["nombreCompleto", "cedula", "programa", "genero", "ciudad", "status", "completionPct"];
    exportToCSV(filtered, exportHeaders, "estudiantes_esumer.csv");
  };

  const columns = [
    { key: "nombreCompleto", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "programa", label: "Programa" },
    { key: "ciudad", label: "Ciudad" },
    { key: "status", label: "Estado" },
    { key: "completionPct", label: "Avance" },
  ];

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Table2 className="w-5 h-5 text-accent-cyan" />
          <h2 className="font-heading font-bold text-xl text-white">Tabla de Estudiantes</h2>
          <span className="text-sm text-gray-500 ml-2">({filtered.length})</span>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-accent-cyan/30 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-accent-cyan/30"
          >
            <option value="all">Todos los estados</option>
            <option value="ready">Listo para grado</option>
            <option value="paid">Ya pagó</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(0); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-accent-cyan/30"
        >
          <option value="all">Pregrado y Posgrado</option>
          <option value="Pregrado">Pregrado</option>
          <option value="Posgrado">Posgrado</option>
        </select>
        <select
          value={programFilter}
          onChange={(e) => { setProgramFilter(e.target.value); setPage(0); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-accent-cyan/30 max-w-[250px]"
        >
          <option value="all">Todos los programas</option>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className={`w-3 h-3 ${sortKey === col.key ? "text-accent-cyan" : ""}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((s, i) => (
              <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3 text-gray-200">{s.nombreCompleto}</td>
                <td className="py-2.5 px-3 text-gray-400">{s.cedula}</td>
                <td className="py-2.5 px-3 text-gray-400 max-w-[200px] truncate">{s.programa}</td>
                <td className="py-2.5 px-3 text-gray-400">{s.ciudad}</td>
                <td className="py-2.5 px-3"><Badge status={s.status} /></td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.completionPct}%`,
                          background: s.completionPct === 100 ? "#00ff88" : s.completionPct >= 75 ? "#ff9f43" : "#ff4757",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(s.completionPct)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = startPage + i;
              if (p >= totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    p === page
                      ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
