"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

interface ReimbursementChartProps {
  reimbursed: number;
  remaining: number;
}

const ReimbursementChart: React.FC<ReimbursementChartProps> = ({
  reimbursed,
  remaining
}) => {
  const series: ApexAxisChartSeries = [
    {
      name: "Reimbursement",
      data: [reimbursed]
    },
    {
      name: "Remaining",
      data: [remaining]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 45,
      stacked: true,
      stackType: "100%",
      toolbar: { show: false },
      sparkline: { enabled: true }
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "100%"
      }
    },

    colors: ["#7298A4", "#E5E7EB"],

    fill: {
      type: "pattern",
      opacity: 1,
      pattern: {
        style: "verticalLines",
        width: 6,
        strokeWidth: 4
      }
    },

    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => val.toString()
      }
    },

    xaxis: {
      categories: ["Total"],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false }
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={45}
    />
  );
};

export default ReimbursementChart;
