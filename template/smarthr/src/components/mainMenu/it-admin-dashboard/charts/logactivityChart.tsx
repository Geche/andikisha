"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const LogActivityChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "performance",
      data: [
        650, 580, 700, 580, 680, 750, 620, 710, 580, 650,
        750, 780, 620, 750, 650, 610, 780, 650, 750, 620,
        720, 600, 780, 620, 750, 610, 710, 800, 620, 750,
        610, 720, 800, 620, 710, 600, 720, 790, 620, 710,
        600, 750, 620, 750, 620, 710, 800, 600, 750, 600
      ],
    },
  ];

  const options: ApexOptions = {
    chart: {
      width: "100%",
      height: 310,
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
      zoom: { enabled: false },
    },

    colors: ["#F26522"],

    stroke: {
      show: true,
      curve: "straight",
      width: 1.5,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },

    xaxis: {
      labels: {
        show: true,
        offsetX: 8,
        rotate: 0,
        style: {
          colors: "#6B7280",
          fontSize: "10px",
        },
        formatter: (_value: string, index?: number) => {
          const labels = [
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
            "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
          ];
          const step = Math.floor(50 / labels.length);
          return index !== undefined && index % step === 0
            ? labels[Math.floor(index / step)]
            : "";
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },

    yaxis: {
      min: 0,
      max: 800,
      tickAmount: 4,
      labels: {
        show: true,
        align: "left",
        minWidth: 40,
        style: {
          colors: "#6B7280",
          fontSize: "10px",
        },
        formatter: (val: number) => val.toString(),
        offsetX: -28,
      },
    },

    grid: {
      show: false,
      padding: {
        left: 10,
        right: 2,
        bottom: 10,
      },
    },

    dataLabels: { enabled: false },

    tooltip: {
      enabled: true,
      theme: "light",
    },
  };

  return (
    <div id="logactivity-chart">
      <Chart options={options} series={series} type="area" height={310} />
    </div>
  );
};

export default LogActivityChart;
