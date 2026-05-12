"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DepreciatedValueChart: React.FC = () => {
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
      width: 100,
      height: 60,
      type: "bar",
      stacked: true,
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
          backgroundBarRadius: 5,
        },
      },
    },

    colors: ["#F26522"],

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

    dataLabels: { enabled: false },
    legend: { show: false },
  };

  return (
    <div id="depreciated-value">
      <Chart options={options} series={series} type="bar" height={60} width={100} />
    </div>
  );
};

export default DepreciatedValueChart;
