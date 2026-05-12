"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AreaChart3: React.FC = () => {
  const [series] = useState([
    {
      name: "Messages",
      data: [8, 5, 6, 3, 4, 6, 7, 3, 8, 6, 4, 7],
    },
  ]);

  const [options] = useState<ApexOptions>({
    chart: {
      type: "bar",
      width: 70,
      height: 70,
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
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2.5,
      curve: "smooth",
    },
    colors: ["#0DCAF0"], // ✅ Cyan/teal variant
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      labels: { show: false },
    },
    tooltip: { enabled: false },
    legend: { show: false },
    grid: { show: false },
  });

  return <Chart options={options} series={series} type="bar" width={70} height={70} />;
};

export default AreaChart3;
