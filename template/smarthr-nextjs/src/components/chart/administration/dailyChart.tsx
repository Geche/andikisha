"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to fix SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DailyChart = () => {
  const [chartConfig] = useState<any>({
    series: [
      {
        name: "Present",
        data: [60, 40, 30, 20, 70],
      },
      {
        name: "Absent",
        data: [20, 60, 45, 60, 80],
      },
    ],
    chart: {
      height: 130,
      type: "line",
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { curve: "smooth" },
    grid: {
      row: { colors: ["#f3f3f3", "transparent"], opacity: 0.5 },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    },
    yaxis: {
      labels: { offsetX: -15 },
    },
    colors: ["#4CAF50", "#F44336"],
  });

  return (
    <div className="w-full flex justify-center items-center">
      <Chart options={chartConfig} series={chartConfig.series} type="line" height={200} />
    </div>
  );
};

export default DailyChart;
