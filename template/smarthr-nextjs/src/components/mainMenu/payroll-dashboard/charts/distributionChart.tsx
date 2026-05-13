"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DistributionChart: React.FC = () => {
  const series = [
    {
      name: "Income Range",
      data: [40, 96, 50, 40, 65, 45, 75, 70, 60, 45, 80],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 240,
      width: "100%",
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        columnWidth: "15px",
        borderRadius: 6,
        borderRadiusApplication: "around",
        distributed: true,
      },
    },

    // Default colors
    colors: [
      "#E5E7EB",
      "#F26522",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
      "#E5E7EB",
    ],

    // 🔥 HOVER EFFECT
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        filter: {
          type: "none",
        },
      },
    },

    // THIS forces hovered bar color
    fill: {
      opacity: 1,
      colors: undefined, // important
    },

    dataLabels: { enabled: false },

    grid: {
      show: true,
      borderColor: "#F3F4F6",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 10 },
    },

    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },

    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        align: "left",
        style: {
          colors: "#6B7280",
          fontSize: "14px",
        },
        offsetX: 6,
        formatter: (val: number) => {
          if (val === 25) return "$30k-50k";
          if (val === 50) return "$50k-80k";
          if (val === 75) return "$80k-120k";
          if (val === 100) return "$120k-180k";
          return "";
        },
      },
      axisBorder: { show: false },
    },

    legend: { show: false },

    tooltip: { enabled: true },
  };

  return (
    <div id="distribution-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={240}
      />
    </div>
  );
};

export default DistributionChart;
