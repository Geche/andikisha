"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TrendChart: React.FC = () => {
  const series = [
    {
      name: "Line 1",
      data: [300, 300, 225, 225, 225],
      color: "#12434e",
    },
    {
      name: "Line 2",
      data: [150, 150, 5, 75, 150],
      color: "#f46a25",
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 305,
      toolbar: { show: false },
    },

    stroke: {
      curve: "stepline",
      width: 2.5,
    },

    markers: {
      size: 5,
      strokeWidth: 0,
      hover: { sizeOffset: 2 },
    },

    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
      labels: {
        show: true,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      min: 0,
      max: 350,
      tickAmount: 4,
      labels: {
        align: "left",
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
          fontWeight: 500,
        },
        formatter: (val: number) => `$${val}k`,
      },
    },

    grid: {
      borderColor: "#f1f1f1",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: {
        right: -7,
      },
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
  };

  return (
    <div id="chart-trend">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={305}
      />
    </div>
  );
};

export default TrendChart;
