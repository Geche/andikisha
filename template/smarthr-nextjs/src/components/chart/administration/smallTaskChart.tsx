"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SmallTaskChart = () => {
  const [chartConfig] = useState<any>({
    chart: {
      width: 100,
      type: "donut",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "30%", // Adjusts the size of the donut hole
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels: ["Label 1", "Label 2", "Label 3"],
    colors: ["#F26522", "rgba(67, 87, 133, .09)"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            show: false,
          },
        },
      },
    ],
    legend: {
      show: false,
    },
  });

  const series = [90, 10];

  return (
    <div className="flex justify-center items-center">
      <Chart options={chartConfig} series={series} type="donut" width={150} />
    </div>
  );
};

export default SmallTaskChart;
