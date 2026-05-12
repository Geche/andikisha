"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EmpDepartmentOptions {
  chart: any;
  fill: any;
  colors: string[];
  grid: any;
  plotOptions: any;
  dataLabels: any;
  series: { data: number[]; name: string }[];
  xaxis: any;
}

export default function EmployeeDepartmentChart() {
  const [empDepartment] = useState<EmpDepartmentOptions>({
    chart: {
      height: 235,
      type: "bar",
      toolbar: { show: false },
    },
    fill: {
      colors: ["#F26522"],
      opacity: 1,
    },
    colors: ["#F26522"],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
      padding: { top: -20, left: 0, right: 0, bottom: 0 },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: true,
        barHeight: "35%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        data: [80, 110, 80, 20, 60, 100],
        name: "Employee",
      },
    ],
    xaxis: {
      categories: ["UI/UX", "Development", "Management", "HR", "Testing", "Marketing"],
      labels: {
        style: {
          colors: "#111827",
          fontSize: "13px",
        },
      },
    },
  });

  return (
    <div className="w-full">
      <Chart
        options={empDepartment}
        series={empDepartment.series}
        type="bar"
        height={235}
      />
    </div>
  );
}
