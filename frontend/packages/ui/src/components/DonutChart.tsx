"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ReactNode } from "react";

export interface DonutSlice {
  name: string;
  value: number;
  /** Explicit hex color. Falls back to the brand palette sequence. */
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  /** Slot rendered in the centre hole. */
  center?: ReactNode;
  /** Outer radius in px. Default: 80. */
  size?: number;
  /** Ring width in px. Default: 22. */
  thickness?: number;
  className?: string;
}

const BRAND_COLORS = ["#0b3d2e", "#166a50", "#27a870", "#d1f5e6", "#e8a020", "#9ca3af"];

export function DonutChart({
  data,
  center,
  size = 80,
  thickness = 22,
  className,
}: DonutChartProps) {
  const innerRadius = size - thickness;
  const diameter = size * 2 + 8;

  return (
    <div className={className} style={{ width: diameter, height: diameter, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={size}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((slice, i) => (
              <Cell
                key={slice.name}
                fill={slice.color ?? BRAND_COLORS[i % BRAND_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 12,
              padding: "4px 10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {center && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          {center}
        </div>
      )}
    </div>
  );
}
