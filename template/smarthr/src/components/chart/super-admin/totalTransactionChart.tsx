"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// Dynamically import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const TotalTransactionChart: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      type: "area",
      width: 80,
      foreColor: "#fff",
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: false,
        top: 3,
        left: 14,
        blur: 4,
        opacity: 0.12,
        color: "#fff",
      },
      sparkline: { enabled: true },
    },
    fill: { type: "solid", opacity: 1 },
    stroke: { width: 0, curve: "monotoneCubic" },
    markers: {
      size: 0,
      colors: ["#F7A37A"],
      strokeColors: "#fff",
      strokeWidth: 0,
      hover: { size: 7 },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "35%" },
    },
    dataLabels: { enabled: false },
    colors: ["#F7A37A"],
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      labels: { show: false },
    },
    tooltip: {
      theme: "dark",
      fixed: { enabled: false },
      x: { show: false },
      marker: { show: false },
    },
  });

  const [series] = React.useState([
    {
      name: "",
      data: [6, 2, 8, 4, 3, 8, 1, 3, 6, 5, 9, 2, 8, 1, 4, 8, 9, 8, 2, 1],
    },
  ]);

  return <Chart options={options} series={series} type="area" height={35} width={60} />;
};

export default TotalTransactionChart;
