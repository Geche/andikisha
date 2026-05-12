"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const HealthChart: React.FC = () => {
  const series = [
    {
      name: "Positive",
      data: [20, 40, 30, 35, 40, 35, 32],
    },
    {
      name: "Negative",
      data: [-20, -40, -30, -35, -40, -35, -32],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 45,
      width: 100,
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    plotOptions: {
      bar: {
        columnWidth: "45%", // roughly 8px wide bars
        borderRadius: 2,
        colors: {
          backgroundBarColors: ["#F8F9FA", "#F8F9FA", "#F8F9FA", "#F8F9FA", "#F8F9FA"],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 5,
        },
      },
    },

    colors: ["#FFC107"], // Amber / Yellow

    grid: {
      show: false,
      padding: { left: 0, right: 0 },
    },

    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      min: -50,
      max: 50,
      show: false,
      axisBorder: { show: false },
    },

    tooltip: { enabled: true },
  };

  return (
    <div id="health-chart">
      <ReactApexChart options={options} series={series} type="bar" height={45} width={100} />
    </div>
  );
};

export default HealthChart;
