"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const HeadcountChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Revenue",
      data: [20, 28, 29, 20, 15, 30, 25, 20, 20, 12, 20, 20, 30, 15, 20, 25]
    },
    {
      name: "Expenses",
      data: [-20, -30, -20, -20, -25, -25, -20, -30, -20, -25, -30, -20, -30, -20, -10, -28]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 240,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: true }
    },

    colors: ["#F26522", "#E5E7EB"],

    grid: {
      padding: {
        top: 5,
        right: 0
      }
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 8,
        borderRadiusApplication: "around",
        borderRadiusWhenStacked: "all"
      }
    },

    dataLabels: {
      enabled: false
    },

    yaxis: {
      opposite: true,
      min: -30,
      max: 30,
      tickAmount: 6,
      labels: {
        offsetX: -5,
        formatter: (val: number) => `${val}K`
      }
    },

    xaxis: {
      categories: [
        "", "", "Jan", "", "", "",
        "Feb", "", "", "",
        "Mar", "", "", "",
        "Apr", ""
      ]
    },

    legend: { show: false },

    fill: {
      opacity: 1
    },

    responsive: [
      {
        breakpoint: 280,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0
          }
        }
      }
    ]
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={240}
    />
  );
};

export default HeadcountChart;
