"use client";

import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DealsStageChart: React.FC = () => {
  const series = [
    {
      name: "Income",
      data: [80, 40, 100, 20],
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
      height: 310,
      toolbar: {
        show: false,
      },
    },
    colors: ["#FF6F28", "#F8F9FA"],
    plotOptions: {
      bar: {
        borderRadius: 20,
        horizontal: false,
      },
    },
    xaxis: {
      categories: ["Inpipeline", "Follow Up", "Schedule", "Conversion"],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
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
    <div id="deals_stage">
      <ApexChart
        options={options}
        series={series}
        type="bar"
        height={310}
      />
    </div>
  );
};

export default DealsStageChart;
