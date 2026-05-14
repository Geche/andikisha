"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "../utils";

export interface BarDatum {
  label: string;
  value: number;
  /** Marks this bar as the highlighted/active bar (e.g. current month). */
  active?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  /** Pixel height of the chart area. Default: 160. */
  height?: number;
  /** Y-axis tick formatter — e.g. (v) => `KES ${v/1000}K` */
  yFormatter?: (value: number) => string;
  /** Active (highlighted) bar color. Default: brand-900. */
  activeColor?: string;
  /** Default bar color. Default: brand-100. */
  defaultColor?: string;
  className?: string;
}

export function BarChart({
  data,
  height = 160,
  yFormatter,
  activeColor = "#0b3d2e",
  defaultColor = "#d1f5e6",
  className,
}: BarChartProps) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value, active: d.active }));

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          barCategoryGap="30%"
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          {yFormatter && (
            <YAxis
              tickFormatter={yFormatter}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
          )}
          <Tooltip
            formatter={(value: number) =>
              yFormatter ? [yFormatter(value), ""] : [value, ""]
            }
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
              padding: "4px 10px",
            }}
            cursor={{ fill: "#f3f4f6" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.active ? activeColor : defaultColor}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
