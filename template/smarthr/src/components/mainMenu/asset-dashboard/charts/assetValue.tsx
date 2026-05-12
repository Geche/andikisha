"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AssetValueChart: React.FC = () => {
  const totalBlocks = 30;
  const filledBlocks = 15; // how many are filled

  const series = [
    {
      data: Array.from({ length: totalBlocks }, (_, i) => {
        if (i === filledBlocks - 1) return 1.6; // tall bar marker
        return 1;
      }),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 65,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },

    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: "75%",
        borderRadius: 3,
      },
    },

    colors: [
      ({ dataPointIndex }: { dataPointIndex: number }) =>
        dataPointIndex < filledBlocks ? "#F26522" : "#F2F4F7",
    ],

    dataLabels: { enabled: false },

    grid: {
      show: false,
      padding: { top: 8, bottom: -6 },
    },

    xaxis: {
      categories: Array(totalBlocks).fill(""),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      show: false,
      min: 0,
      max: 1.6,
    },

    tooltip: { enabled: false },
    legend: { show: false },

    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <div id="asset-value">
      <Chart options={options} series={series} type="bar" height={65} />
    </div>
  );
};

export default AssetValueChart;
