import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, GraduationCap, Users } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { AnimatedProgress } from "../charts/AnimatedProgress";
import { GaugeChart } from "../charts/GaugeChart";
import { classifyProgram, formatNumber } from "../../lib/utils";

function ProgramCard({ program, students }) {
  const [expanded, setExpanded] = useState(false);

  const ready = students.filter((s) => s.status === "ready");
  const authorized = students.filter((s) => s.status === "authorized");
  const pending = students.filter((s) => s.status === "pending");
  const advancePct = students.length > 0 ? (ready.length / students.length) * 100 : 0;

  return (
    <Card className="animate-slide-in" hover={false}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 text-left"
      >
        <div className="p-2 rounded-lg bg-accent-cyan/10">
          <GraduationCap className="w-5 h-5 text-accent-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-white text-sm sm:text-base truncate">
            {program}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{students.length} estudiantes</span>
            <span className="text-status-ready">{ready.length} listos</span>
            <span className="text-status-paid">{authorized.length} aut. pago</span>
            <span className="text-status-pending">{pending.length} pendientes</span>
          </div>
        </div>
        <div className="hidden sm:block">
          <GaugeChart value={ready.length} max={students.length} color="#00ff88" size={80} />
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {/* Progress bar always visible */}
      <div className="mt-3">
        <AnimatedProgress
          value={ready.length}
          max={students.length}
          color="#00ff88"
          count={ready.length}
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
          {/* Student lists */}
          {ready.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-status-ready uppercase tracking-wider mb-2">
                Listos para grado ({ready.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ready.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-white/[0.02]">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-ready" />
                    <span className="text-gray-300 truncate">{s.nombreCompleto}</span>
                    <span className="text-gray-500 text-xs ml-auto">{s.cedula}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-status-pending uppercase tracking-wider mb-2">
                Pendientes ({pending.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {pending.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-white/[0.02]">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-pending" />
                    <span className="text-gray-300 truncate">{s.nombreCompleto}</span>
                    <span className="text-gray-500 text-xs ml-auto">{s.cedula}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function ProgramSection({ students }) {
  const [activeTab, setActiveTab] = useState("all");

  const grouped = useMemo(() => {
    const map = {};
    for (const s of students) {
      const p = s.programa;
      if (!map[p]) map[p] = [];
      map[p].push(s);
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [students]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return grouped;
    return grouped.filter(([prog]) => classifyProgram(prog) === activeTab);
  }, [grouped, activeTab]);

  const tabs = [
    { key: "all", label: "Todos" },
    { key: "Pregrado", label: "Pregrado" },
    { key: "Posgrado", label: "Posgrado" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-cyan" />
          <h2 className="font-heading font-bold text-xl text-white">Por Programa</h2>
        </div>
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20"
                  : "text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(([program, studs]) => (
          <ProgramCard key={program} program={program} students={studs} />
        ))}
      </div>
    </div>
  );
}
