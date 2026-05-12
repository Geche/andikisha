"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

interface MfaChartProps {
  totalBlocks?: number;
  filledBlocks?: number;
}

const MfaChart: React.FC<MfaChartProps> = ({
  totalBlocks = 15,
  filledBlocks = 11,
}) => {
  const series = [
    {
      data: Array(totalBlocks).fill(1),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 16,
      width: "100%",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: "85%",
        borderRadius: 8,
        borderRadiusApplication: "around",
      },
    },
    colors: [
      ({ dataPointIndex }: { dataPointIndex: number }) =>
        dataPointIndex < filledBlocks ? "#F26522" : "#E5E7EB",
    ],
    dataLabels: { enabled: false },
    grid: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false, max: 1 },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <div id="mfa-chart">
      <Chart options={options} series={series} type="bar" height={16} />
    </div>
  );
};

export default MfaChart;
