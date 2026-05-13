"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

interface ArrivalMiniChartProps {
  filledBars: number;   // how many bars are orange
  totalBars?: number;   // default = 8
}

const ArrivalMiniChart: React.FC<ArrivalMiniChartProps> = ({
  filledBars,
  totalBars = 8
}) => {
  const barValue = 30;

  const series: ApexAxisChartSeries = [
    {
      name: "Positive",
      data: Array(totalBars).fill(barValue)
    },
    {
      name: "Negative",
      data: Array(totalBars).fill(-barValue)
    }
  ];

  const colors = Array.from({ length: totalBars }, (_, i) =>
    i < filledBars ? "#F26522" : "#F1F1F1"
  );

  const options: ApexOptions = {
    chart: {
      type: "bar",
      width: 70,
      height: 35,
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },

    plotOptions: {
      bar: {
        columnWidth: "35%",
        borderRadius: 2,
        distributed: true
      }
    },

    colors,

    grid: {
      show: false,
      padding: { left: 0, right: 0 }
    },

    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: {
      min: -40,
      max: 40,
      show: false
    },

    legend: { show: false },

    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => Math.abs(val).toString()
      }
    }
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      width={70}
      height={35}
    />
  );
};

export default ArrivalMiniChart;
