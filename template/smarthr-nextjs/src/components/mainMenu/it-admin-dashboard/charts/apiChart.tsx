"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const ApiChart: React.FC = () => {
  const series = [
    {
      name: "Positive",
      data: [15, 40, 30, 35, 40, 35, 32],
    },
    {
      name: "Negative",
      data: [-15, -40, -30, -35, -40, -35, -32],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 60,
      width: 80,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 2,
        colors: {
          backgroundBarColors: [
            "#F8F9FA",
            "#F8F9FA",
            "#F8F9FA",
            "#F8F9FA",
            "#F8F9FA",
          ],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 2,
        },
      },
    },
    colors: ["#F26522"], // Orange
    grid: { show: false },
    dataLabels: { enabled: false },
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
    <div id="api-chart">
      <Chart options={options} series={series} type="bar" height={60} width={80} />
    </div>
  );
};

export default ApiChart;
