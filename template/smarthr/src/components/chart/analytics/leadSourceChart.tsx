"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// Prevent SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LeadSourceChart: React.FC = () => {
  const [options] = useState<ApexOptions>({
    chart: {
      type: "donut",
      height: 185,
      toolbar: { show: false },
    },
    labels: ["Paid", "Google", "Referals", "Campaigns"],
    colors: ["#FFC107", "#0C4B5E", "#AB47BC", "#FD3995"],
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Google",
              formatter: () => "40%",
            },
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
      show: true,
      width: 0,
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  });

  const [series] = useState([25, 30, 10, 35]);

  return <Chart options={options} series={series} type="donut" height={185} />;
};

export default LeadSourceChart;
