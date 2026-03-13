import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════ */
const API_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbzetrEeYbHaMdR1QouC0T8WAoC65J_ClxgRT0e_Ja8KH46uhpPoI8LV65Q8cwRRhiVEOQ/exec";
const REFRESH_INTERVAL = 30000;

/* ═══════════════════════════════════════════════════════════
   THEMES
   ═══════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#06080f", bg2: "#0c1120", bg3: "#151d30",
    card: "rgba(14,20,38,0.7)", border: "rgba(99,102,241,0.12)",
    text: "#e2e8f0", muted: "#64748b", muted2: "#94a3b8",
    accent: "#6366f1", accent2: "#06b6d4",
    positive: "#10b981", negative: "#ef4444", warning: "#f59e0b",
    inputBg: "rgba(15,23,42,0.6)", headerBg: "rgba(6,8,15,0.85)",
    shadow: "rgba(0,0,0,0.4)", gridColor: "rgba(99,102,241,0.03)",
  },
  light: {
    bg: "#f1f5f9", bg2: "#e2e8f0", bg3: "#cbd5e1",
    card: "rgba(255,255,255,0.85)", border: "rgba(99,102,241,0.15)",
    text: "#0f172a", muted: "#64748b", muted2: "#475569",
    accent: "#4f46e5", accent2: "#0891b2",
    positive: "#059669", negative: "#dc2626", warning: "#d97706",
    inputBg: "#eef2f7", headerBg: "rgba(241,245,249,0.9)",
    shadow: "rgba(0,0,0,0.06)", gridColor: "rgba(79,70,229,0.04)",
  },
};

const CC = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ec4899","#f97316","#8b5cf6","#14b8a6","#84cc16","#ef4444","#3b82f6","#a855f7","#22d3ee","#e879f9","#facc15"];

/* ═══════════════════════════════════════════════════════════
   REQUIREMENTS
   ═══════════════════════════════════════════════════════════ */
const REQS = [
  { key: "CEDULA", label: "Cédula", icon: "🪪" },
  { key: "SABER 11", label: "Saber 11", icon: "📝" },
  { key: "ACTA DE GRADO", label: "Acta de Grado", icon: "📜" },
  { key: "SABER TYT", label: "Saber TyT", icon: "📋" },
  { key: "SABER PRO", label: "Saber Pro", icon: "🎯" },
  { key: "ASIGNATURAS", label: "Asignaturas", icon: "📚" },
  { key: "REQUISITO B2", label: "Requisito B2", icon: "🌐" },
  { key: "CARTERA", label: "Cartera", icon: "💳" },
];

function isMet(v) {
  if (!v) return false;
  const s = v.toString().toLowerCase().trim();
  return ["cumple","si","sí","ok","x","✓","✔","aprobado","true","1","completo","entregado","paz y salvo","a paz y salvo"].includes(s);
}

function findH(hs, ...cs) {
  for (const c of cs) { const f = hs.find(h => h.toLowerCase().includes(c.toLowerCase())); if (f) return f; }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════════════════════ */
function ANum({ value, suffix = "" }) {
  const [d, setD] = useState(0);
  const p = useRef(0);
  useEffect(() => {
    const s = p.current, e = value; p.current = value;
    if (s === e) { setD(e); return; }
    const t0 = Date.now();
    const tick = () => {
      const pr = Math.min((Date.now() - t0) / 900, 1);
      setD(Math.round(s + (e - s) * (1 - Math.pow(1 - pr, 3))));
      if (pr < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{d.toLocaleString("es-CO")}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════════════════ */
const TT = ({ active, payload, label, theme }) => {
  if (!active || !payload?.length) return null;
  const t = THEMES[theme || "dark"];
  return (
    <div style={{ background: theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(10,15,30,0.95)", border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: `0 8px 32px ${t.shadow}`, backdropFilter: "blur(12px)" }}>
      <p style={{ color: t.muted, fontSize: 11, margin: "0 0 3px", letterSpacing: 0.3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || t.text, fontSize: 14, fontWeight: 700, margin: 0 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("es-CO") : p.value}
        </p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("overview");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [show, setShow] = useState(false);

  const t = THEMES[theme];

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Entrance animation
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  // Fetch data with retry for transient network errors
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await fetch(API_URL + "?t=" + Date.now(), {
        redirect: "follow",
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("La API no devolvió JSON válido. Verifica que el Google Apps Script esté desplegado correctamente.");
      }
      if (json.success && json.rows) {
        setData(json.rows);
        setHeaders(json.headers || []);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(json.error || "Formato de respuesta inválido — verifica el script de Google Sheets.");
      }
    } catch (err) {
      const msg = err.message.includes("Failed to fetch") || err.message.includes("NetworkError")
        ? "Error de red: verifica tu conexión a internet o que la URL de Google Apps Script sea accesible."
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const iv = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchData]);
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL / 1000);
    const iv = setInterval(() => setCountdown(c => c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1), 1000);
    return () => clearInterval(iv);
  }, [lastUpdate]);

  /* ── STATS ── */
  const stats = useMemo(() => {
    if (!data?.length) return null;
    const N = data.length;
    const hProg = findH(headers, "Programa") || "Programa del cual Egresa";
    const hGen = findH(headers, "Género", "Genero") || "Género";
    const hCity = findH(headers, "Ciudad de Residencia") || "Ciudad de Residencia";
    const hEmp = findH(headers, "Nombre de la Empresa", "Empresa") || "Nombre de la Empresa";
    const hTS = headers[0] || "Marca temporal";

    const grp = (key) => {
      const m = {};
      data.forEach(d => { const v = d[key] || "N/A"; m[v] = (m[v] || 0) + 1; });
      return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const progData = grp(hProg).map(d => ({ ...d, short: d.name.length > 45 ? d.name.substring(0, 45) + "…" : d.name }));
    const genData = grp(hGen);
    const cityData = grp(hCity).slice(0, 15);

    const reqStats = REQS.map(r => {
      const hk = findH(headers, r.key) || r.key;
      const met = data.filter(d => isMet(d[hk])).length;
      return { ...r, hk, met, N, pct: N ? Math.round(met / N * 100) : 0 };
    });

    const getReqCount = (d) => REQS.filter(r => isMet(d[findH(headers, r.key) || r.key])).length;
    const fullyComplete = data.filter(d => getReqCount(d) === REQS.length).length;
    const avgComp = N ? Math.round(data.reduce((a, d) => a + getReqCount(d), 0) / (N * REQS.length) * 100) : 0;
    const employed = data.filter(d => d[hEmp] && d[hEmp].length > 1).length;

    // Timeline
    const byDate = {};
    data.forEach(d => {
      const ts = d[hTS]; if (!ts) return;
      const ds = ts.split(" ")[0]; if (ds) byDate[ds] = (byDate[ds] || 0) + 1;
    });
    const timeline = Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    let cum = 0;
    timeline.forEach(d => { cum += d.count; d.cumulative = cum; });

    // Completion distribution
    const compDist = Array.from({ length: 9 }, (_, i) => ({ label: `${Math.round(i / 8 * 100)}%`, value: 0 }));
    data.forEach(d => { compDist[Math.round(getReqCount(d) / REQS.length * 8)].value++; });

    // Funnel
    const funnel = [
      { l: "Total Inscritos", v: N, c: "#6366f1" },
      { l: "≥ 50% Req.", v: data.filter(d => getReqCount(d) >= 4).length, c: "#06b6d4" },
      { l: "≥ 75% Req.", v: data.filter(d => getReqCount(d) >= 6).length, c: "#f59e0b" },
      { l: "100% Completo", v: fullyComplete, c: "#10b981" },
    ];

    const radar = reqStats.map(r => ({ subject: r.label, pct: r.pct, fullMark: 100 }));

    return { N, progData, genData, cityData, reqStats, fullyComplete, avgComp, employed, timeline, compDist, funnel, radar };
  }, [data, headers]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, border: `3px solid ${t.border}`, borderTop: `3px solid ${t.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: t.muted2, fontSize: 15 }}>Conectando con Google Sheets...</p>
          <p style={{ color: t.muted, fontSize: 12 }}>Cargando datos en tiempo real</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error && !data) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 20 }}>
        <div style={{ textAlign: "center", padding: 36, background: t.card, borderRadius: 24, border: `1px solid ${t.negative}33`, maxWidth: 480, backdropFilter: "blur(20px)" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
          <h2 style={{ color: t.text, marginBottom: 6, fontSize: 20 }}>Error de Conexión</h2>
          <p style={{ color: t.muted2, marginBottom: 20, fontSize: 14 }}>{error}</p>
          <button onClick={() => { setLoading(true); fetchData(); }}
            style={{ padding: "12px 28px", background: `linear-gradient(135deg,${t.accent},#7c3aed)`, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
            Reintentar
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "General", icon: "📊" },
    { id: "pipeline", label: "Pipeline", icon: "🔄" },
    { id: "demographics", label: "Demografía", icon: "👥" },
    { id: "timeline", label: "Tendencia", icon: "📈" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", color: t.text,
      backgroundImage: `linear-gradient(${t.gridColor} 1px, transparent 1px),linear-gradient(90deg, ${t.gridColor} 1px, transparent 1px)`,
      backgroundSize: "52px 52px", transition: "background 0.4s, color 0.4s",
    }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${t.bg}}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        body{margin:0;background:${t.bg};transition:background .4s}
      `}</style>

      {/* Radial orbs */}
      <div style={{ position: "fixed", top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${t.accent}08 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${t.accent2}06 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* ═══ HEADER ═══ */}
      <header style={{
        padding: "18px 28px", borderBottom: `1px solid ${t.border}`, background: t.headerBg,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, background: `linear-gradient(135deg,${t.accent},${t.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                🎓 Grados Abril 2026-1
              </h1>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.positive, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: t.positive, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>En vivo</span>
            </div>
            <p style={{ color: t.muted, fontSize: 12, fontWeight: 500 }}>Institución Universitaria ESUMER · Inscripción Ceremonia de Grados</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              {lastUpdate && <div style={{ color: t.muted, fontSize: 11 }}>Act: {lastUpdate.toLocaleTimeString("es-CO")}</div>}
              <div style={{ color: t.muted, fontSize: 10, opacity: 0.7 }}>Próxima: {countdown}s</div>
            </div>
            {/* Theme toggle */}
            <button onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
              style={{ width: 36, height: 36, borderRadius: 10, background: `${t.accent}15`, border: `1px solid ${t.border}`, color: t.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s" }}
              title="Cambiar tema">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {/* Refresh */}
            <button onClick={() => fetchData(true)} disabled={refreshing}
              style={{
                padding: "8px 14px", background: `${t.accent}12`, color: refreshing ? t.muted : t.accent,
                border: `1px solid ${t.border}`, borderRadius: 10, cursor: refreshing ? "default" : "pointer",
                fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, transition: "all .3s",
              }}>
              <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>🔄</span>
              {refreshing ? "…" : "Actualizar"}
            </button>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: 1480, margin: "0 auto", padding: "22px 28px 48px", position: "relative", zIndex: 1,
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.7s cubic-bezier(0.34, 1.2, 0.64, 1)",
      }}>
        {stats && (
          <>
            {/* ═══ KPIs ═══ */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
              {[
                { l: "Total Inscritos", v: stats.N, icon: "👥", c: t.accent },
                { l: "100% Completos", v: stats.fullyComplete, icon: "✅", c: t.positive, sub: `${stats.N ? Math.round(stats.fullyComplete / stats.N * 100) : 0}% del total` },
                { l: "Completitud Prom.", v: stats.avgComp, icon: "📊", c: t.accent2, suf: "%" },
                { l: "Programas", v: stats.progData.length, icon: "🏛️", c: "#8b5cf6" },
                { l: "Empleados", v: stats.employed, icon: "💼", c: t.warning, sub: `${stats.N ? Math.round(stats.employed / stats.N * 100) : 0}% empleabilidad` },
              ].map((k, i) => (
                <div key={i} style={{
                  background: t.card, backdropFilter: "blur(20px)", border: `1px solid ${t.border}`,
                  borderRadius: 18, padding: "20px 22px", transition: "all .3s", cursor: "default",
                  opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 60}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${k.c}15`; e.currentTarget.style.borderColor = `${k.c}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = t.border; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{k.icon}</span>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.c, opacity: 0.5, boxShadow: `0 0 12px ${k.c}66` }} />
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, fontFamily: "'DM Mono',monospace" }}>
                    <ANum value={k.v} />{k.suf && <span style={{ fontSize: 16, color: t.muted2, fontWeight: 500 }}>{k.suf}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 5, fontWeight: 600 }}>{k.l}</div>
                  {k.sub && <div style={{ fontSize: 11, color: k.c, marginTop: 2, fontWeight: 700 }}>{k.sub}</div>}
                </div>
              ))}
            </div>

            {/* ═══ TABS ═══ */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {tabs.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  style={{
                    padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .3s", whiteSpace: "nowrap",
                    ...(tab === tb.id
                      ? { background: `linear-gradient(135deg,${t.accent},#7c3aed)`, color: "#fff", boxShadow: `0 4px 20px ${t.accent}35` }
                      : { background: t.card, color: t.muted, border: `1px solid ${t.border}` }),
                  }}
                  onMouseEnter={e => { if (tab !== tb.id) { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = `${t.accent}40`; } }}
                  onMouseLeave={e => { if (tab !== tb.id) { e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border; } }}
                >
                  {tb.icon} {tb.label}
                </button>
              ))}
            </div>

            {/* ── Card wrapper ── */}
            {(() => {
              const cd = (extra = {}) => ({
                background: t.card, backdropFilter: "blur(20px)", border: `1px solid ${t.border}`,
                borderRadius: 20, padding: 24, transition: "all .3s", ...extra,
              });
              const h3s = { margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: t.muted2, fontFamily: "'Plus Jakarta Sans',sans-serif" };

              /* ═══ OVERVIEW ═══ */
              if (tab === "overview") return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "fadeUp .4s ease" }}>
                  {/* Programs */}
                  <div style={cd({ gridColumn: stats.progData.length > 4 ? "1/-1" : "1" })}>
                    <h3 style={h3s}>🏛️ Inscritos por Programa</h3>
                    <ResponsiveContainer width="100%" height={Math.max(260, stats.progData.length * 44)}>
                      <BarChart data={stats.progData.map(d => ({ ...d, name: d.short || d.name }))} layout="vertical" margin={{ left: 10, right: 28 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} horizontal={false} />
                        <XAxis type="number" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: t.muted2, fontSize: 10 }} width={280} axisLine={false} />
                        <Tooltip content={<TT theme={theme} />} />
                        <Bar dataKey="value" name="Inscritos" radius={[0, 8, 8, 0]} maxBarSize={24}>
                          {stats.progData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Gender */}
                  <div style={cd()}>
                    <h3 style={h3s}>👥 Distribución por Género</h3>
                    <ResponsiveContainer width="100%" height={270}>
                      <PieChart>
                        <Pie data={stats.genData} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {stats.genData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                        </Pie>
                        <Tooltip content={<TT theme={theme} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Radar */}
                  <div style={cd()}>
                    <h3 style={h3s}>🎯 Radar de Requisitos</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={stats.radar}>
                        <PolarGrid stroke={`${t.accent}18`} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: t.muted2, fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: t.muted, fontSize: 9 }} />
                        <Radar name="% Cumplimiento" dataKey="pct" stroke={t.accent} fill={t.accent} fillOpacity={0.18} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Cities */}
                  <div style={cd()}>
                    <h3 style={h3s}>📍 Top Ciudades</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.cityData} margin={{ left: 0, right: 14 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                        <XAxis dataKey="name" tick={{ fill: t.muted2, fontSize: 9, angle: -35 }} interval={0} height={55} />
                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                        <Tooltip content={<TT theme={theme} />} />
                        <Bar dataKey="value" name="Inscritos" radius={[6, 6, 0, 0]} maxBarSize={34}>
                          {stats.cityData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );

              /* ═══ PIPELINE ═══ */
              if (tab === "pipeline") return (
                <div style={{ animation: "fadeUp .4s ease" }}>
                  <div style={cd({ marginBottom: 16 })}>
                    <h3 style={{ ...h3s, marginBottom: 4 }}>📋 Pipeline de Requisitos de Grado</h3>
                    <p style={{ margin: "0 0 20px", color: t.muted, fontSize: 12 }}>Estado de cumplimiento por cada requisito</p>
                    {stats.reqStats.map((r, i) => (
                      <div key={r.key} style={{
                        display: "flex", alignItems: "center", padding: "14px 16px", borderRadius: 14,
                        background: theme === "dark" ? "rgba(10,14,30,0.4)" : "rgba(241,245,249,0.6)",
                        marginBottom: 6, border: `1px solid transparent`, transition: "all .3s",
                        animation: `slideIn .4s ease ${i * 0.05}s both`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.accent}20`; e.currentTarget.style.background = `${t.accent}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = theme === "dark" ? "rgba(10,14,30,0.4)" : "rgba(241,245,249,0.6)"; }}
                      >
                        <span style={{ fontSize: 20, marginRight: 12, width: 30, textAlign: "center" }}>{r.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 12, color: t.muted, fontFamily: "'DM Mono',monospace" }}>
                                <span style={{ color: t.positive, fontWeight: 700 }}>{r.met}</span> / {r.N}
                              </span>
                              <span style={{
                                fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                                fontFamily: "'DM Mono',monospace",
                                background: r.pct >= 80 ? `${t.positive}15` : r.pct >= 50 ? `${t.warning}15` : `${t.negative}15`,
                                color: r.pct >= 80 ? t.positive : r.pct >= 50 ? t.warning : t.negative,
                              }}>{r.pct}%</span>
                            </div>
                          </div>
                          <div style={{ height: 7, borderRadius: 4, background: `${t.accent}10`, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 4, transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
                              width: `${r.pct}%`,
                              background: r.pct >= 80 ? `linear-gradient(90deg,${t.positive},${t.accent2})` : r.pct >= 50 ? `linear-gradient(90deg,${t.warning},#f97316)` : `linear-gradient(90deg,${t.negative},#ec4899)`,
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Funnel */}
                    <div style={cd()}>
                      <h3 style={h3s}>🏆 Embudo de Completitud</h3>
                      {stats.funnel.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.c}10`, border: `1px solid ${s.c}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: "'DM Mono',monospace" }}>{s.v}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{s.l}</div>
                            <div style={{ height: 7, borderRadius: 4, background: `${t.accent}10`, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 4, width: `${stats.N ? s.v / stats.N * 100 : 0}%`, background: s.c, transition: "width 1s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.c, fontFamily: "'DM Mono',monospace" }}>{stats.N ? Math.round(s.v / stats.N * 100) : 0}%</span>
                        </div>
                      ))}
                    </div>
                    {/* Completion Dist */}
                    <div style={cd()}>
                      <h3 style={h3s}>📊 Distribución de Completitud</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats.compDist}>
                          <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                          <XAxis dataKey="label" tick={{ fill: t.muted2, fontSize: 10 }} />
                          <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                          <Tooltip content={<TT theme={theme} />} />
                          <Bar dataKey="value" name="Estudiantes" radius={[6, 6, 0, 0]} maxBarSize={30}>
                            {stats.compDist.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} fillOpacity={0.8} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );

              /* ═══ DEMOGRAPHICS ═══ */
              if (tab === "demographics") return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, animation: "fadeUp .4s" }}>
                  <div style={cd()}>
                    <h3 style={h3s}>👥 Género</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={stats.genData} cx="50%" cy="50%" outerRadius={105} dataKey="value" stroke="none"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {stats.genData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                        </Pie>
                        <Tooltip content={<TT theme={theme} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={cd()}>
                    <h3 style={h3s}>📍 Ciudades de Residencia</h3>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {stats.cityData.map((c, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 12px", borderRadius: 10, marginBottom: 3,
                          background: i % 2 === 0 ? `${t.accent}04` : "transparent",
                          transition: "background .2s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 22, height: 22, borderRadius: 6, background: `${CC[i % CC.length]}18`, color: CC[i % CC.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i + 1}</span>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: CC[i % CC.length], fontSize: 14, fontFamily: "'DM Mono',monospace" }}>{c.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={cd({ gridColumn: "1/-1" })}>
                    <h3 style={h3s}>🏛️ Detalle por Programa Académico</h3>
                    <ResponsiveContainer width="100%" height={Math.max(240, stats.progData.length * 42)}>
                      <BarChart data={stats.progData.map(d => ({ ...d, name: d.short || d.name }))} layout="vertical" margin={{ left: 10, right: 28 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} horizontal={false} />
                        <XAxis type="number" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: t.muted2, fontSize: 10 }} width={280} axisLine={false} />
                        <Tooltip content={<TT theme={theme} />} />
                        <Bar dataKey="value" name="Inscritos" radius={[0, 8, 8, 0]} maxBarSize={22}>
                          {stats.progData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );

              /* ═══ TIMELINE ═══ */
              if (tab === "timeline") return (
                <div style={{ display: "grid", gap: 16, animation: "fadeUp .4s" }}>
                  <div style={cd()}>
                    <h3 style={h3s}>📈 Inscripciones Acumuladas</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={stats.timeline} margin={{ left: 0, right: 18, top: 8 }}>
                        <defs>
                          <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={t.accent} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                        <XAxis dataKey="date" tick={{ fill: t.muted2, fontSize: 10 }} angle={-30} height={50} />
                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                        <Tooltip content={<TT theme={theme} />} />
                        <Area type="monotone" dataKey="cumulative" name="Acumulado" stroke={t.accent} fill="url(#gA)" strokeWidth={3}
                          dot={{ fill: t.accent, r: 4, strokeWidth: 0 }} activeDot={{ r: 7, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={cd()}>
                    <h3 style={h3s}>📊 Inscripciones Diarias</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.timeline} margin={{ left: 0, right: 14 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.gridColor} />
                        <XAxis dataKey="date" tick={{ fill: t.muted2, fontSize: 10 }} angle={-30} height={50} />
                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} />
                        <Tooltip content={<TT theme={theme} />} />
                        <Bar dataKey="count" name="Inscripciones" radius={[6, 6, 0, 0]} maxBarSize={30}>
                          {stats.timeline.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} fillOpacity={0.8} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );

              return null;
            })()}
          </>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ textAlign: "center", padding: "18px 28px", color: t.muted, fontSize: 11, borderTop: `1px solid ${t.border}`, position: "relative", zIndex: 1 }}>
        Dashboard en tiempo real · Institución Universitaria ESUMER · Auto-refresh {REFRESH_INTERVAL / 1000}s · Google Sheets API
      </footer>
    </div>
  );
}
