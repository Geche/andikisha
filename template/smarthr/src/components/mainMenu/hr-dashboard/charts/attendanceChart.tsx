"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AttendanceChart: React.FC = () => {
  const series = [
    {
      name: "Present",
      data: [600, 300, 300, 700, 400, 600, 600],
    },
    {
      name: "Absent",
      data: [50, 100, 50, 50, 100, 100, 100],
    },
    {
      name: "Late",
      data: [100, 50, 150, 100, 150, 50, 150],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 260,
      stacked: false,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },

    colors: ["#F26522", "#004C6D", "#FFC700"],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 2,
        borderRadiusApplication: "end",
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 0.5,
        },
      },
    },

    stroke: {
      show: true,
      width: 2, // creates inner gap
      colors: ["transparent"],
    },

    fill: {
      type: "pattern",
      opacity: 1,
      pattern: {
        style: "horizontalLines",
        width: 5,
        height: 20,
        strokeWidth: 24,
      },
    },

    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        style: { colors: "#6B7280" },
      },
    },

    yaxis: {
      min: 0,
      max: 800,
      labels: {
        offsetX: -16,
      },
    },

    grid: {
      show: true,
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      padding: {
        left: 0,
      },
    },

    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: true },
  };

  return (
    <div id="attendance-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={260}
      />
    </div>
  );
};

export default AttendanceChart;
