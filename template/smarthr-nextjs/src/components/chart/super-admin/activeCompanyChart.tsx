"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ActiveCompanyChart: React.FC = () => {
  const [options] = React.useState<ApexOptions>({
    chart: {
      type: "area",
      width: 50,
      foreColor: "#fff",
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
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0, opacityTo: 0 },
    },
    markers: {
      size: 0,
      colors: ["#F26522"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 7 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        // endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2.5, curve: "smooth" },
    colors: ["#F26522"],
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    tooltip: {
      theme: "dark",
      fixed: { enabled: false },
      x: { show: false },
      y: {
        title: { formatter: () => "" },
      },
      marker: { show: false },
    },
  });

  const [series] = React.useState([
    {
      name: "Active Company",
      data: [25, 40, 35, 20, 36, 9, 21],
    },
  ]);

  return <Chart options={options} series={series} type="area" height={70} width={120} />;
};

export default ActiveCompanyChart;
