"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

interface Props {
  filled: number;      // how many dots are filled
  total?: number;      // total dots (default 24)
}

const AgentPerformance: React.FC<Props> = ({ filled, total = 24 }) => {
  const series = [
    {
      data: Array.from({ length: total }, (_, i) => ({
        x: i + 1,
        y: 1,
        fillColor: i < filled ? "#F26522" : "#E5E7EB",
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "scatter",
      height: 18,
      sparkline: { enabled: true },
    },
    markers: {
      size: 5.5,
      shape: "circle",
      strokeWidth: 0,
    },
    xaxis: {
      min: 0,
      max: total + 1,
      labels: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
    legend: { show: false },
  };

  return <Chart options={options} series={series} type="scatter" height={18} />;
};

export default AgentPerformance;
