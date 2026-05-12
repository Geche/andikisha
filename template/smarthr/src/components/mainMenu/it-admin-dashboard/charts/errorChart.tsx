"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const ErrorHeatmapChart: React.FC = () => {
  const series = [
    { name: "M9", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,80] },
    { name: "M8", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,80] },
    { name: "M7", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,80] },
    { name: "M6", data: [0,0,0,0,0,40,0,0,0,0,0,0,40,0,0,0,80,80] },
    { name: "M5", data: [0,0,0,40,0,80,80,0,0,0,80,80,0,0,80,0,40,80] },
    { name: "M4", data: [80,80,0,80,0,0,80,0,40,80,0,0,0,0,0,40,80,80] },
    { name: "M3", data: [80,80,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    { name: "M2", data: [80,80,80,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0] },
    { name: "M1", data: [80,80,80,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0] },
  ];

  const options: ApexOptions = {
    chart: {
      type: "heatmap",
      height: 310,
      toolbar: { show: false },
    },
    stroke: {
      width: 4,
      colors: ["#fff"],
    },
    plotOptions: {
      heatmap: {
        radius: 8,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0, name: "none", color: "#F1F3F4" },
            { from: 1, to: 50, name: "low", color: "#FFB38A" },
            { from: 51, to: 100, name: "high", color: "#F26522" },
          ],
        },
      },
    },
    dataLabels: { enabled: false },

    tooltip: {
      enabled: true,
      x: { show: false },
      marker: { show: false },
    },

    grid: {
      show: false,
      padding: {
        left: -10,
        right: 0,
        bottom: 0,
      },
    },

    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },

    yaxis: {
      labels: { show: false },
    },

    legend: { show: false },
  };

  return (
    <div id="error-chart">
      <Chart options={options} series={series} type="heatmap" height={310} />
    </div>
  );
};

export default ErrorHeatmapChart;
