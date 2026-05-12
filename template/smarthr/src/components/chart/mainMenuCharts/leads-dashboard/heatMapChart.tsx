"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

const HeatMapChart = () => {
  const series = [
    {
      name: "0",
      data: [
        { x: "Mon", y: 22 },
        { x: "Tue", y: 29 },
        { x: "Wed", y: 13 },
        { x: "Thu", y: 32 },
        { x: "Fri", y: 32 },
        { x: "Sat", y: 32 },
        { x: "Sun", y: 32 },
      ],
    },
    {
      name: "20",
      data: [
        { x: "Mon", y: 22, color: "#ff5722" }, // per-cell color works
        { x: "Tue", y: 29 },
        { x: "Wed", y: 13 },
        { x: "Thu", y: 32 },
        { x: "Fri", y: 32 },
        { x: "Sat", y: 32 },
        { x: "Sun", y: 32 },
      ],
    },
    {
      name: "40",
      data: [
        { x: "Mon", y: 22 },
        { x: "Tue", y: 29 },
        { x: "Wed", y: 13 },
        { x: "Thu", y: 32 },
        { x: "Fri", y: 32 },
        { x: "Sat", y: 32 },
        { x: "Sun", y: 32 },
      ],
    },
    {
      name: "60",
      data: [
        { x: "Mon", y: 0 },
        { x: "Tue", y: 29 },
        { x: "Wed", y: 13 },
        { x: "Thu", y: 32 },
        { x: "Fri", y: 0 },
        { x: "Sat", y: 0 },
        { x: "Sun", y: 32 },
      ],
    },
    {
      name: "80",
      data: [
        { x: "Mon", y: 0 },
        { x: "Tue", y: 20 },
        { x: "Wed", y: 13 },
        { x: "Thu", y: 32 },
        { x: "Fri", y: 0 },
        { x: "Sat", y: 0 },
        { x: "Sun", y: 32 },
      ],
    },
    {
      name: "120",
      data: [
        { x: "Mon", y: 0 },
        { x: "Tue", y: 0 },
        { x: "Wed", y: 75 },
        { x: "Thu", y: 0 },
        { x: "Fri", y: 0 },
        { x: "Sat", y: 0 },
        { x: "Sun", y: 0 },
      ],
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "heatmap",
      height: 300,
      toolbar: { show: false },
    },

    colors: [
      "#9CA3AF",
      "#F37438",
      "#9CA3AF",
      "#F37438",
      "#9CA3AF",
      "#F37438",
    ],

    dataLabels: {
      enabled: true,
    },

    stroke: {
      width: 2,
      colors: ["#fff"],
    },

    grid: {
      padding: { right: 10 },
    },

    legend: {
      show: false,
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="heatmap"
      height={300}
    />
  );
};

export default HeatMapChart;
