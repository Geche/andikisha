"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SalesIncomeOptions {
  chart: any;
  colors: string[];
  responsive: any[];
  plotOptions: any;
  series: { name: string; data: number[] }[];
  xaxis: any;
  yaxis: any;
  grid: any;
  legend: any;
  dataLabels: any;
  fill: any;
}

export default function SalesIncomeChart() {
  const [salesIncome] = useState<SalesIncomeOptions>({
    chart: {
      height: 290,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#FF6F28", "#F8F9FA"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: "all",
        horizontal: false,
        endingShape: "rounded",
      },
    },
    series: [
      {
        name: "Income",
        data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80],
      },
      {
        name: "Expenses",
        data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20],
      },
    ],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
      padding: {
        left: -8,
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: { opacity: 1 },
  });

  return (
    <div className="w-full">
      <Chart
        options={salesIncome}
        series={salesIncome.series}
        type="bar"
        height={290}
      />
    </div>
  );
}
