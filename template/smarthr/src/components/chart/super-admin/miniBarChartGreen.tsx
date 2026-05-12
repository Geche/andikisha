"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MiniBarChartGreen: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      type: "bar",
      width: 70,
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: false,
        top: 3,
        left: 14,
        blur: 4,
        opacity: 0.12,
        color: "#fff",
      },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        // endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2.5,
      curve: "smooth",
    },
    colors: ["#2DCB73"], // Green shade
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      labels: { show: false },
    },
    tooltip: {
      enabled: false,
    },
  });

  const [series] = React.useState([
    {
      name: "Messages",
      data: [5, 10, 7, 5, 10, 7, 5],
    },
  ]);

  return <Chart options={options} series={series} type="bar" height={70} width={120} />;
};

export default MiniBarChartGreen;
