import { useEffect, useState } from "react";

export function AnimatedProgress({ value, max = 100, color = "#00d4ff", label, count, height = 8 }) {
  const [width, setWidth] = useState(0);
  const pct = max > 0 ? (value / max) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{label}</span>
          <div className="flex items-center gap-2">
            {count != null && <span className="text-gray-500 text-xs">{count}/{max}</span>}
            <span className="font-medium" style={{ color }}>{Math.round(pct)}%</span>
          </div>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-bar"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
