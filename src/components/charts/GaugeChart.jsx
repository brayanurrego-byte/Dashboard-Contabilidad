import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export function GaugeChart({ value, max = 100, label, color = "#00d4ff", size = 140 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const data = [
    { name: "bg", value: 100, fill: "rgba(255,255,255,0.04)" },
    { name: "value", value: pct, fill: color },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size / 2 + 20 }} className="relative">
        <ResponsiveContainer width="100%" height={size}>
          <RadialBarChart
            cx="50%"
            cy="100%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
            barSize={10}
          >
            <RadialBar
              background={false}
              dataKey="value"
              cornerRadius={5}
              animationDuration={800}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-lg font-heading font-bold" style={{ color }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-400 text-center">{label}</span>}
    </div>
  );
}
