import { useEffect, useState, useRef } from "react";
import { Users, CheckCircle2, CreditCard, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../ui/Card";
import { formatNumber, formatPct } from "../../lib/utils";

function AnimatedNumber({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return formatNumber(display);
}

const kpiConfig = [
  {
    key: "total",
    label: "Total Graduandos",
    icon: Users,
    color: "#00d4ff",
    glowClass: "glow-blue",
  },
  {
    key: "ready",
    label: "Listos para grado",
    icon: CheckCircle2,
    color: "#00ff88",
    glowClass: "glow-green",
  },
  {
    key: "paid",
    label: "Ya pagaron",
    icon: CreditCard,
    color: "#ff9f43",
    glowClass: "glow-orange",
  },
  {
    key: "pending",
    label: "Pendientes",
    icon: AlertTriangle,
    color: "#ff4757",
    glowClass: "glow-red",
  },
];

export function KPICards({ students }) {
  const total = students.length;
  const ready = students.filter((s) => s.status === "ready").length;
  const paid = students.filter((s) => s.status === "paid").length;
  const pending = students.filter((s) => s.status === "pending").length;
  const readyPct = total > 0 ? (ready / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  const values = { total, ready, paid, pending };

  return (
    <div className="space-y-4">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map(({ key, label, icon: Icon, color, glowClass }, i) => (
          <Card
            key={key}
            className={`animate-fade-up ${glowClass}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              {key === "ready" && total > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#00ff88" }}>
                  <TrendingUp className="w-3 h-3" />
                  {formatPct(readyPct)}
                </span>
              )}
              {key === "pending" && total > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#ff4757" }}>
                  <TrendingDown className="w-3 h-3" />
                  {formatPct(pendingPct)}
                </span>
              )}
            </div>
            <p className="text-3xl font-heading font-bold text-white mb-1">
              <AnimatedNumber value={values[key]} />
            </p>
            <p className="text-sm text-gray-400">{label}</p>
          </Card>
        ))}
      </div>

      {/* Percentage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">% Listos para grado</p>
              <p className="text-2xl font-heading font-bold" style={{ color: "#00ff88" }}>
                {formatPct(readyPct)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
              style={{
                borderColor: `rgba(0,255,136,0.3)`,
                background: `conic-gradient(#00ff88 ${readyPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              }}
            >
              <div className="w-10 h-10 rounded-full bg-deep-700 flex items-center justify-center text-xs font-bold text-status-ready">
                {Math.round(readyPct)}
              </div>
            </div>
          </div>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">% Pendientes</p>
              <p className="text-2xl font-heading font-bold" style={{ color: "#ff4757" }}>
                {formatPct(pendingPct)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
              style={{
                borderColor: `rgba(255,71,87,0.3)`,
                background: `conic-gradient(#ff4757 ${pendingPct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              }}
            >
              <div className="w-10 h-10 rounded-full bg-deep-700 flex items-center justify-center text-xs font-bold text-status-pending">
                {Math.round(pendingPct)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
