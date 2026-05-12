"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const UsageChart: React.FC = () => {
  const series = [
    {
      name: "performance",
      data: [1200, 1200, 4800, 4800, 2000, 6000, 6000, 8000, 8000],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#2E5A65"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      lineCap: "round",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 90, 95],
      },
    },
    grid: {
      show: true,
      borderColor: "#E5E7EB",
      strokeDashArray: 0,
      padding: {
        left: 0,
        right: -20,
      },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", ""],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: true },
    },
    yaxis: {
      min: 0,
      max: 8000,
      tickAmount: 4,
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (val: number) => (val === 0 ? "0" : `${val / 1000}K`),
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      x: { show: false },
    },
    legend: { show: false },
  };

  return (
    <div id="Usage-chart">
      <Chart options={options} series={series} type="area" height={220} />
    </div>
  );
};

export default UsageChart;
