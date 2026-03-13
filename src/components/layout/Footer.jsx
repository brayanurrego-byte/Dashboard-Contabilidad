import { Clock } from "lucide-react";
import { timeAgo } from "../../lib/utils";

export function Footer({ lastUpdate }) {
  return (
    <footer className="border-t border-white/5 py-6 mt-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
        <p>Dashboard Grados ESUMER — Abril 2026-1</p>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Última actualización: {lastUpdate ? timeAgo(lastUpdate) : "—"}
          </span>
        </div>
      </div>
    </footer>
  );
}
