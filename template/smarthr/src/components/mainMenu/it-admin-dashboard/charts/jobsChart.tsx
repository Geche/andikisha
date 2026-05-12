"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const JobsChart: React.FC = () => {
  const series = [
    {
      name: "Jobs",
      data: [45, 30, 70, 15, 45, 100, 45, 35, 25, 15, 25],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 50,
      width: 80,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 2,
        distributed: true, // Each bar can have different color
      },
    },
    colors: [
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
      "#F26522", // Active bar
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
      "#E9ECEF",
    ],
    grid: {
      show: false,
      padding: {
        left: 2,
        right: 2,
        bottom: 2,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    tooltip: { enabled: true },
    legend: { show: false },
  };

  return (
    <div id="jobs-chart">
      <Chart options={options} series={series} type="bar" height={50} width={80} />
    </div>
  );
};

export default JobsChart;
