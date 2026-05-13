"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TenantSupportChart5: React.FC = () => {
  const series = [
    {
      name: "Solved",
      data: [80],
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

    colors: ["#03C95A"],

    fill: {
      colors: ["#03C95A"],
      opacity: 1,
    },

    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "60%",
        colors: {
          backgroundBarColors: ["#EAF8F0"],
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
      offsetY: -20, // pushes label upward like your original
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

export default TenantSupportChart5;
