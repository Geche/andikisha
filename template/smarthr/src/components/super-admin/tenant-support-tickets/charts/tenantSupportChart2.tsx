"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TenantSupportChart2: React.FC = () => {
  const series = [
    {
      name: "Open",
      data: [30],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      width: 50,
      height: 115,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    colors: ["#AB47BC"],

    fill: {
      colors: ["#AB47BC"],
      opacity: 1,
    },

    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "60%",
        colors: {
          backgroundBarColors: ["#F7EEF9"],
          backgroundBarOpacity: 0.5,
          backgroundBarRadius: 10,
        },
      },
    },

    states: {
      hover: {
        filter: { type: "darken" },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none" },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: 0,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
        fontWeight: "bold",
      },
    },

    xaxis: {
      categories: ["Day"],
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    yaxis: {
      show: false,
      min: 0,
      max: 100,
    },

    grid: { show: false },
    tooltip: { enabled: true },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={115}
      width={50}
    />
  );
};

export default TenantSupportChart2;
