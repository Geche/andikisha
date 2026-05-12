"use client";

import React from "react";

import dynamic from "next/dynamic";

const ApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const LeadsStageChart: React.FC = () => {
  const series = [
    {
      name: "Income",
      data: [80, 40, 60, 40],
    },
    {
      name: "Expenses",
      data: [100, 100, 100, 100],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 345,
      toolbar: {
        show: false,
      },
    },
    colors: ["#FF6F28", "#F8F9FA"],
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: "all",
        horizontal: false,
      },
    },
    xaxis: {
      categories: ["Competitor", "Budget", "Unresponsie", "Timing"],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "9px",
        },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "10px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
  };

  return (
    <div id="leads_stage">
      <ApexChart
        options={options}
        series={series}
        type="bar"
        height={345}
      />
    </div>
  );
};

export default LeadsStageChart;
