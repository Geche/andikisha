"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AssetsAvailableChart: React.FC = () => {
  const series = [
    {
      name: "Assets",
      data: [
        14, 18, 12, 22, 16, 24, 28, 15, 20, 14, 18, 11, 13, 23,
        25, 26, 17, 14, 12, 24, 16, 12, 10, 20, 18, 15, 12, 18,
      ],
    },
  ];

  const highlightIndex = 20; // Purple bar

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 116,
      width: "100%",
      parentHeightOffset: 0,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "80%",
        distributed: true,
      },
    },

    colors: [
      ({ dataPointIndex }: { dataPointIndex: number }) =>
        dataPointIndex === highlightIndex ? "#AB47BC" : "#F2F4F7",
    ],

    dataLabels: { enabled: false },
    legend: { show: false },

    grid: {
      show: false,
      padding: {
        left: -10,
        right: -15,
        bottom: -8,
        top: -50,
      },
    },

    xaxis: {
      categories: [
        "", "", "", "01-08", "", "", "", "", "", "",
        "09-16", "", "", "", "", "", "", "16-24",
        "", "", "", "", "", "", "25-30",
      ],
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "inherit",
          fontWeight: 400,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },

    yaxis: { show: false },
    tooltip: { enabled: false },

    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <div id="assets-available">
      <Chart options={options} series={series} type="bar" height={116} />
    </div>
  );
};

export default AssetsAvailableChart;
