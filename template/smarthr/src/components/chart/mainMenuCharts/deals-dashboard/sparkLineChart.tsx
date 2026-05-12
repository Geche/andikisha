"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SparkLineProps {
  data: number[];
  fillColor: string;
  strokeColor: string;
}

const SparkLine: React.FC<SparkLineProps> = ({
  data,
  fillColor,
  strokeColor,
}) => {
  const series = [
    {
      data,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area", // 🔥 IMPORTANT (area enables fill)
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      width: 2,
      colors: [strokeColor],
      curve: "straight", // Peity-like edges
    },
    fill: {
      type: "solid",
      opacity: 0.35, // 👈 this makes fill visible
      colors: [fillColor],
    },
    tooltip: {
      enabled: false,
    },
  };

  return (
    <ApexChart
      options={options}
      series={series}
      type="area"
      width="60%"
      height={20}
    />
  );
};

export default SparkLine;
