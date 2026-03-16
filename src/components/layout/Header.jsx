import { GraduationCap, RefreshCw } from "lucide-react";

export function Header({ refreshing, onRefresh }) {
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-esumer.svg"
                alt="ESUMER"
                className="header-logo"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="items-center gap-2 hidden" style={{ display: "none" }}>
                <GraduationCap className="w-8 h-8 text-accent-cyan" />
                <span className="font-heading font-bold text-lg text-accent-cyan">ESUMER</span>
              </div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-white leading-tight">
                Dashboard Grados
              </h1>
              <p className="text-xs text-accent-cyan/70 font-medium tracking-wider uppercase">
                Abril 2026-1
              </p>
            </div>
          </div>

          {/* Live Indicator + Refresh */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ready opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ready" />
              </span>
              En vivo
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-accent-cyan/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin-slow" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
