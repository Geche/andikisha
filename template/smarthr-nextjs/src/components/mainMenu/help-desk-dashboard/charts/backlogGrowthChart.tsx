"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const BacklogGrowthChart: React.FC = () => {
  const maxValue = 700;
  const actual = [80, 280, 330, 410, 470, 520, 560];
  const remaining = actual.map((v) => maxValue - v);

  const series = [
    { name: "Growth", data: actual },
    { name: "Remaining", data: remaining },
  ];

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },

    colors: ["#0F4C5C", "#EEF2F5"],

    plotOptions: {
      bar: {
        columnWidth: "80%",
        borderRadius: 8,
        borderRadiusWhenStacked: "last",
      },
    },

    stroke: {
      width: [0, 1],
      colors: ["transparent", "#CBD5E1"],
      dashArray: [0, 6],
    },

    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: {
        offsetX: 1,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },

    yaxis: {
      max: maxValue,
      tickAmount: 7,
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },

    grid: {
      borderColor: "#e5e7eb00",
      strokeDashArray: 5,
      padding: {
        right: -13,
        left: -8,
      },
    },

    legend: { show: false },
    dataLabels: { enabled: false },

    fill: {
      opacity: [1, 1],
    },
  };

  return (
    <div id="backlog-growth">
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default BacklogGrowthChart;
