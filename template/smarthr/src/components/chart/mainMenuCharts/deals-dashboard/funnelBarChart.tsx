"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useState } from "react";

// ✅ Dynamically import to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function FunnelBarChart() {
  const [chartOptions] = useState<ApexOptions>({
    series: [
      {
        name: "Leads",
        data: [1380, 1100, 990, 880, 740, 540],
      },
    ],
    chart: {
      type: "bar",
      height: 280,
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        distributed: true,
        barHeight: "80%",
        isFunnel: true, // 👈 Funnel style
      },
    },
    colors: ["#F26522", "#F37438", "#F5844E", "#F69364", "#F7A37A", "#F9B291"],
    dataLabels: {
      enabled: true,
      formatter: function (_val, opt) {
        return opt?.w?.globals?.labels?.[opt.dataPointIndex] ?? "";
      },
      dropShadow: {
        enabled: true,
      },
      style: {
        fontSize: "13px",
        fontWeight: 500,
        colors: ["#111827"], // dark text
      },
    },
    xaxis: {
      categories: [
        "Marketing : 7,898",
        "Sales : 4658",
        "Email : 2898",
        "Chat : 789",
        "Operational : 655",
        "Calls : 454",
      ],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
      padding: {
        left: 0,
        right: 0,
      },
    },
  });

  return (
    <div className="w-full h-[280px]">
      <ReactApexChart
        options={chartOptions}
        series={chartOptions.series as ApexOptions["series"]}
        type="bar"
        height={280}
      />
    </div>
  );
}
