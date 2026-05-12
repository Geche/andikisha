"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const BudgetChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Budget",
      data: [5, 10, 8, 6, 5, 10, 8, 10],
    },
    {
      name: "Spent",
      data: [15, 20, 16, 15, 15, 20, 18, 20],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 280,
      toolbar: { show: false },
    },

    colors: ["#F26522", "#0C4B5E"],

    dataLabels: { enabled: false },

    stroke: {
      curve: "straight",
      width: 1,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },

    xaxis: {
      categories: [
        "Engineering",
        "Sales",
        "Marketing",
        "Operations",
        "Support",
        "Admin",
        "UI/UX",
        "Devops",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      min: 0,
      max: 40,
      labels: {
        offsetX: -15,
        formatter: (value: number) => `${value}k`,
      },
    },

    grid: {
      show: false,
      padding: {
        left: 0,
        right: -15,
        top: 0,
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
    },

    tooltip: {
      y: {
        formatter: (val: number) => `$${val}k`,
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={280}
    />
  );
};

export default BudgetChart;
