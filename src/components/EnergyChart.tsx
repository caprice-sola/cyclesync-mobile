import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


export type MetricsPoint = {
  date: string;   // e.g. "2025-11-14"
  energy?: number;
  rpe?: number;
  sleep?: number;
  phase?: string;
};

type MetricsChartProps = {
  data: MetricsPoint[];
};

function formatLabelDate(label: string): string {
  const d = new Date(label);
  if (Number.isNaN(d.getTime())) return label;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}


export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Log Energy, RPE, or Sleep values to see them here.
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 18, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fontSize: 10 }}
            tickCount={8}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = value as number;
              const label =
                name === "energy"
                  ? "Energy"
                  : name === "rpe"
                  ? "RPE"
                  : name === "sleep"
                  ? "Sleep (h)"
                  : name;
              return [v.toFixed(1), label];
            }}
            labelFormatter={(label, payload) => {
  const pretty = formatLabelDate(String(label));
  const phase = payload[0]?.payload?.phase as string | undefined;
  return phase ? `${pretty} — ${phase}` : pretty;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => {
              if (value === "energy") return "Energy";
              if (value === "rpe") return "RPE";
              if (value === "sleep") return "Sleep (h)";
              return value;
            }}
          />

          {/* Energy line */}
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />

          {/* RPE line */}
          <Line
            type="monotone"
            dataKey="rpe"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />

          {/* Sleep line */}
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
