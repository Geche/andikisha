"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// Prevent SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DealsStageChart: React.FC = () => {
  const [options] = useState<ApexOptions>({
    chart: {
      height: 310,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#FF6F28", "#F8F9FA"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
      },
    },
    xaxis: {
      categories: ["Inpipeline", "Follow Up", "Schedule", "Conversion"],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: { opacity: 1 },
  });

  const [series] = useState([
    {
      name: "Income",
      data: [80, 40, 100, 20],
    },
    {
      name: "Expenses",
      data: [100, 100, 100, 100],
    },
  ]);

  return <Chart options={options} series={series} type="bar" height={310} />;
};

export default DealsStageChart;
