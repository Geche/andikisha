"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DeductionChart: React.FC = () => {
  const series = [
    {
      name: "Deduction",
      data: [15, 40, 30, 35, 40, 35, 32],
    },
    {
      name: "Deduction",
      // Mirror values (negative)
      data: [-15, -40, -30, -35, -40, -35, -32],
    },
  ];

  const options: ApexOptions = {
    chart: {
      width: 100,
      height: 70,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    colors: ["#F26522"],

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 0.5,
          backgroundBarRadius: 4,
        },
      },
    },

    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    yaxis: {
      min: -50,
      max: 50,
      show: false,
    },

    grid: {
      show: false,
    },

    tooltip: {
      enabled: true,
    },
  };

  return (
    <div id="deduction-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        width={100}
        height={70}
      />
    </div>
  );
};

export default DeductionChart;
