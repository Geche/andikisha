"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const StoragesChart: React.FC = () => {
  const series = [
    {
      name: "Storage",
      data: [280, 260, 140, 68, 120, 260],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 264,
      toolbar: { show: false },
    },
    colors: ["#0C4B5E", "#0C4B5E", "#F26522", "#0C4B5E", "#0C4B5E", "#0C4B5E"],
    plotOptions: {
      bar: {
        columnWidth: "65%",
        borderRadius: 10,
        distributed: true,
        colors: {
          backgroundBarColors: ["#E5E7EB"],
          backgroundBarOpacity: 0.4,
          backgroundBarRadius: 10,
        },
        dataLabels: {
          position: "bottom",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: 10,
      style: {
        fontSize: "14px",
        fontWeight: "500",
        colors: ["#FFFFFF"],
      },
      formatter: (val: number) => `${val} GB`,
    },
    xaxis: {
      categories: [
        "HR",
        "Payroll",
        "Attendance",
        "Recruitment",
        "Leaves",
        "Document",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        offsetY: 5,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 320,
      tickAmount: 4,
      labels: {
        offsetX: -15,
        style: {
          fontSize: "13px",
          fontWeight: 500,
          colors: "#6B7280",
        },
      },
    },
    grid: {
      show: true,
      borderColor: "#F3F4F6",
      strokeDashArray: 3,
      padding: {
        bottom: 0,
        left: -10,
        right: -55,
      },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { enabled: true },
  };

  return (
    <div id="storages-chart">
      <Chart options={options} series={series} type="bar" height={264} />
    </div>
  );
};

export default StoragesChart;
