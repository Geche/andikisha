"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const ContributionChart: React.FC = () => {
  const series = [
    {
      name: "Positive",
      data: [10, 30, 20, 25, 30, 25, 22],
    },
    {
      name: "Negative",
      data: [-10, -30, -20, -25, -30, -25, -22],
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

    colors: ["#0C4B5E"], // Dark Teal

    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
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
    <div id="contribution-chart">
      <ReactApexChart options={options} series={series} type="bar" height={45} width={100} />
    </div>
  );
};

export default ContributionChart;
