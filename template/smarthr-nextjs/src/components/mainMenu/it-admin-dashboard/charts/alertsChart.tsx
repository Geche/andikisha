"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AlertsChart: React.FC = () => {
  const series = [
    {
      name: "performance",
      data: [10, 25, 15, 45, 20, 50, 30, 15],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 45,
      width: 100,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    colors: ["#0C4B5E"],
    stroke: {
      curve: "straight",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    tooltip: { enabled: true },
  };

  return (
    <div id="alerts-chart">
      <Chart options={options} series={series} type="area" height={45} width={100} />
    </div>
  );
};

export default AlertsChart;
