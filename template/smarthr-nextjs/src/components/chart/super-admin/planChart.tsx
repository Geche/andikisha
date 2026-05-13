"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PlanChart: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      height: 240,
      type: "donut",
      toolbar: { show: false },
    },
    colors: ["#FFC107", "#1B84FF", "#F26522"],
    labels: ["Enterprise", "Premium", "Basic"],
    plotOptions: {
      pie: {
        donut: {
          size: "50%",
          labels: { show: false },
          // ⚠️ borderRadius is not a valid ApexCharts option,
          // if you want rounded edges, use `stroke.lineCap: "round"`
        },
      },
    },
    stroke: {
      lineCap: "round",
      show: true,
      width: 0, // space between donut sections
      colors: ["#fff"],
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 180 },
          legend: { position: "bottom" },
        },
      },
    ],
  });

  const [series] = React.useState<number[]>([20, 60, 20]);

  return <Chart options={options} series={series} type="donut" height={240} />;
};

export default PlanChart;
