"use client"; // if you’re using Next.js App Router (app/ directory)

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts (client-side only)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CompanyChart: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      height: 240,
      type: "bar",
      toolbar: { show: false },
    },
    colors: ["#212529"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: { position: "bottom", offsetX: -10, offsetY: 0 },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 10,
        borderRadiusWhenStacked: "all",
        horizontal: false,
        colors: {
          backgroundBarColors: ["#f3f4f5"],
          backgroundBarOpacity: 0.5,
        },
       
        
      },
    },
    xaxis: {
      categories: ["M", "T", "W", "T", "F", "S", "S"],
      labels: { style: { colors: "#6B7280", fontSize: "13px" } },
    },
    yaxis: { labels: { offsetX: -15, show: false } },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
      padding: { left: -8 },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: { opacity: 1 },
  });

  const [series] = React.useState([
    { name: "Company", data: [40, 60, 20, 80, 60, 60, 60] },
  ]);

  return <Chart options={options} series={series} type="bar" height={240} />;
};

export default CompanyChart;
