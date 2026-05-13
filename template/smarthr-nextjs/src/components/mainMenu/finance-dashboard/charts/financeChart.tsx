"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const FinanceChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Amount",
      data: [30, 60, 30, 40, 100, 80, 90, 50, 60, 40, 30, 60],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 140,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    colors: ["#FF7129"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.6,
        opacityTo: 0.2,
        stops: [0, 100],
        colorStops: [
          [
            { offset: 0, color: "#9CB9C2", opacity: 0.6 },
            { offset: 100, color: "#F8F9FA", opacity: 0.2 },
          ],
        ],
      },
    },

    plotOptions: {
      bar: {
        columnWidth: "80%",
        borderRadius: 12,
        distributed: false,
        dataLabels: {
          position: "top",
        },
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 0.5,
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#111827", fontSize: "12px" },
      },
    },

    yaxis: {
      min: 0,
      max: 100,
      labels: { show: false },
    },

    grid: {
      show: false,
      padding: { left: 0, right: 0, top: 0 },
    },

    legend: { show: false },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={140}
    />
  );
};

export default FinanceChart;
