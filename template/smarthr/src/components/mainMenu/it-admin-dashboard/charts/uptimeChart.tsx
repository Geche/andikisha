"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const UptimeChart: React.FC = () => {
  const series = [
    {
      name: "performance",
      data: [6, 20, 75, 40, 100, 92, 43, 76, 5],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 50,
      width: 80,
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    colors: ["#FF8C42"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  };

  return (
    <div id="uptime-chart">
      <Chart options={options} series={series} type="area" height={50} width={80} />
    </div>
  );
};

export default UptimeChart;
