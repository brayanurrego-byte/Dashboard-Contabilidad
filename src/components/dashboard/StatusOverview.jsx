import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "../ui/Card";
import { DonutChart } from "../charts/DonutChart";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import { classifyProgram } from "../../lib/utils";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="glass px-3 py-2 text-sm border border-white/10">
      <p className="text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function StatusOverview({ students }) {
  const statusData = useMemo(() => [
    { name: "Listos para graduación", value: students.filter((s) => s.status === "ready").length, color: "#00ff88" },
    { name: "Autorización de pago", value: students.filter((s) => s.status === "authorized").length, color: "#ff9f43" },
    { name: "Pendientes", value: students.filter((s) => s.status === "pending").length, color: "#ff4757" },
  ], [students]);

  const programData = useMemo(() => {
    const map = {};
    for (const s of students) {
      if (!map[s.programa]) map[s.programa] = { name: s.programa, ready: 0, authorized: 0, pending: 0, total: 0 };
      map[s.programa][s.status]++;
      map[s.programa].total++;
    }
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [students]);

  const levelData = useMemo(() => {
    const pre = { name: "Pregrado", ready: 0, authorized: 0, pending: 0, total: 0 };
    const post = { name: "Posgrado", ready: 0, authorized: 0, pending: 0, total: 0 };
    for (const s of students) {
      const target = classifyProgram(s.programa) === "Posgrado" ? post : pre;
      target[s.status]++;
      target.total++;
    }
    return [pre, post];
  }, [students]);

  const genderData = useMemo(() => {
    const map = {};
    for (const s of students) {
      const g = s.genero || "Sin dato";
      map[g] = (map[g] || 0) + 1;
    }
    const colors = ["#00d4ff", "#a78bfa", "#00ff88", "#ff9f43"];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [students]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status donut */}
      <Card hover={false} className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center gap-2 mb-3">
          <PieIcon className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-heading font-semibold text-white">Distribución por Estado</h3>
        </div>
        <DonutChart
          data={statusData}
          centerLabel="Estudiantes"
          centerValue={students.length}
          height={240}
        />
        <div className="flex justify-center gap-4 mt-3">
          {statusData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-gray-400">{d.name}</span>
              <span className="font-medium text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Gender donut */}
      <Card hover={false} className="animate-fade-up" style={{ animationDelay: "0.55s" }}>
        <div className="flex items-center gap-2 mb-3">
          <PieIcon className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-heading font-semibold text-white">Distribución por Género</h3>
        </div>
        <DonutChart
          data={genderData}
          centerLabel="Total"
          centerValue={students.length}
          height={240}
        />
        <div className="flex justify-center gap-4 mt-3">
          {genderData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-gray-400">{d.name}</span>
              <span className="font-medium text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Program bar chart */}
      <Card hover={false} className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "0.6s" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-heading font-semibold text-white">Estudiantes por Programa</h3>
        </div>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={180}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => (v.length > 25 ? v.slice(0, 25) + "..." : v)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="ready" name="Listos" fill="#00ff88" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="authorized" name="Aut. pago" fill="#ff9f43" stackId="a" />
              <Bar dataKey="pending" name="Pendientes" fill="#ff4757" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pregrado vs Posgrado */}
      <Card hover={false} className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "0.65s" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-heading font-semibold text-white">Pregrado vs Posgrado</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {levelData.map((lv) => (
            <div key={lv.name} className="text-center">
              <h4 className="font-heading font-semibold text-white mb-3">{lv.name}</h4>
              <DonutChart
                data={[
                  { name: "Listos", value: lv.ready, color: "#00ff88" },
                  { name: "Aut. pago", value: lv.authorized, color: "#ff9f43" },
                  { name: "Pendientes", value: lv.pending, color: "#ff4757" },
                ]}
                centerLabel={lv.name}
                centerValue={lv.total}
                height={200}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
