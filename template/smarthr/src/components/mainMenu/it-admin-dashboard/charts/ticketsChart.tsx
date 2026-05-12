"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TicketsChart: React.FC = () => {
  const series = [
    {
      name: "Positive",
      data: [60, 0, 60, 0, 60, 0, 60],
    },
    {
      name: "Negative",
      data: [-60, 0, -60, 0, -60, 0, -60],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 50,
      width: 80,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 2,
        colors: {
          backgroundBarColors: Array(7).fill("#F8F9FA"),
          backgroundBarOpacity: 1,
          backgroundBarRadius: 2,
        },
      },
    },
    colors: ["#F26522"],
    dataLabels: { enabled: false },
    grid: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: -50,
      max: 50,
      show: false,
    },
    tooltip: { enabled: true },
  };

  return (
    <div id="tickets-chart">
      <Chart options={options} series={series} type="bar" height={50} width={80} />
    </div>
  );
};

export default TicketsChart;
