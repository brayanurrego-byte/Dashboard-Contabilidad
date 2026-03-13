import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="glass px-3 py-2 text-sm">
      <span style={{ color: d.payload.color }}>{d.name}</span>
      <span className="text-white ml-2 font-semibold">{d.value}</span>
    </div>
  );
};

export function DonutChart({ data, centerLabel, centerValue, height = 260 }) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
            animationBegin={100}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                stroke="transparent"
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-heading font-bold text-white">{centerValue}</span>
          <span className="text-xs text-gray-400 mt-1">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
