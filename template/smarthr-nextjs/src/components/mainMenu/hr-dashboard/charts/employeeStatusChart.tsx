"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const EmployeeStatusChart: React.FC = () => {
  const series = [
    { name: "Full Time", data: [1054] },
    { name: "Contract", data: [568] },
    { name: "Probation", data: [80] },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 45,
      stacked: true,
      stackType: "100%",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "100%",
      },
    },
    colors: ["#F26522", "#0C4B5E", "#F8F9FA"],
    fill: {
      type: "pattern",
      opacity: 1,
      pattern: {
        style: "verticalLines",
        width: 6,
        strokeWidth: 4,
      },
    },
    tooltip: {
      enabled: true,
    },
    xaxis: {
      categories: ["Total"],
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div id="status-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={45}
      />
    </div>
  );
};

export default EmployeeStatusChart;
