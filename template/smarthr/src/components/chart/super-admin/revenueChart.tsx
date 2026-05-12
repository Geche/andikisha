"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const RevenueChart: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      height: 230,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#FF6F28", "#F8F9FA"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: { position: "bottom", offsetX: -10, offsetY: 0 },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: "all",
        horizontal: false,
        // endingShape: "rounded",
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: { style: { colors: "#6B7280", fontSize: "13px" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        offsetX: -15,
        style: { colors: "#6B7280", fontSize: "13px" },
        formatter: function (value: number) {
          return value + "K";
        },
      },
    },
    grid: {
      borderColor: "transparent",
      strokeDashArray: 5,
      padding: { left: -8 },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val / 10 + " k";
        },
      },
    },
    fill: { opacity: 1 },
  });

  const [series] = React.useState([
    {
      name: "Income",
      data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80],
    },
    {
      name: "Expenses",
      data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20],
    },
  ]);

  return <Chart options={options} series={series} type="bar" height={230} />;
};

export default RevenueChart;
