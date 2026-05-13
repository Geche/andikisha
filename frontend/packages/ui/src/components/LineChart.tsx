"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../utils";

export interface LineDatum {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineDatum[];
  /** Show filled area under the line. Default: true. */
  area?: boolean;
  /** Pixel height. Default: 160. */
  height?: number;
  /** Line + area fill color. Default: brand-500. */
  color?: string;
  /** Y-axis tick formatter. */
  yFormatter?: (value: number) => string;
  className?: string;
}

export function LineChart({
  data,
  area = true,
  height = 160,
  color = "#27a870",
  yFormatter,
  className,
}: LineChartProps) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  const commonProps = {
    data: chartData,
    margin: { top: 4, right: 4, left: 4, bottom: 0 },
  };

  const axes = (
    <>
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
      />
    </>
  );

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {area ? (
          <AreaChart {...commonProps}>
            {axes}
            <defs>
              <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill="url(#lineAreaGradient)"
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : (
          <RechartsLineChart {...commonProps}>
            {axes}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
