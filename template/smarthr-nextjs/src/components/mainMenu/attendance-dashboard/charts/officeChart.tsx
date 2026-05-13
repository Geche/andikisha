"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const OfficeChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Series A",
      data: [
        [1, 220], [1.2, 230], [1.5, 280], [1.8, 240],
        [2, 270], [2.2, 340], [2.5, 270],
        [3, 250], [3.5, 300],
        [4, 250], [4.2, 310], [4.5, 320],
        [5, 280], [5.5, 320], [5.8, 300],
        [6, 310], [6.2, 360], [6.5, 320],
        [7, 300]
      ]
    },
    {
      name: "Series B",
      data: [
        [1, 100], [1.2, 20], [1.4, 40], [1.6, 80],
        [2, 30], [2.2, 100], [2.5, 40], [2.8, 80],
        [3, 110], [3.2, 160], [3.5, 170],
        [4, 150], [4.2, 230], [4.5, 260], [4.8, 240],
        [5, 290], [5.2, 240], [5.5, 270], [5.8, 250],
        [6, 300], [6.5, 260],
        [7, 300], [7.5, 330]
      ]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: "scatter",
      height: 200,
      toolbar: { show: false },
      zoom: { enabled: false }
    },

    colors: ["#0C4B5E", "#F26522"],

    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 10, bottom: -10, left: -10 }
    },

    markers: {
      size: 6,
      strokeWidth: 0,
      hover: { size: 8 }
    },

    xaxis: {
      min: 0.5,
      max: 7.8,
      tickAmount: 7,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px"
        },
        formatter: (value: string, timestamp?: number, opts?: any) => {
          const val = parseFloat(value);
          const days = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          return days[Math.floor(val)] || "";
        }
      }
    },

    yaxis: {
      min: 0,
      max: 400,
      tickAmount: 4,
      labels: {
        offsetX: -15,
        style: {
          colors: "#64748B",
          fontSize: "12px"
        },
        formatter: (val: number) => val.toFixed(0)
      }
    },

    legend: { show: false }
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="scatter"
      height={200}
    />
  );
};

export default OfficeChart;
