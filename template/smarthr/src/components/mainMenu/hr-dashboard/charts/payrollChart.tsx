"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const PayrollChart: React.FC = () => {
  const series = [
    {
      name: "Payroll",
      data: [45, 15, 30, 25, 20, 45, 40],
    },
  ];

  const options: ApexOptions = {
    chart: {
      width: 100,
      height: 40,
      type: "bar",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    colors: ["#0C4B5E"],

    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusWhenStacked: "all",
        borderRadiusApplication: "around",
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 0.5,
          backgroundBarRadius: 4,
        },
      },
    },

    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    yaxis: {
      show: false,
    },

    grid: {
      show: false,
    },

    tooltip: {
      enabled: true,
    },
  };

  return (
    <div id="payroll-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        width={100}
        height={40}
      />
    </div>
  );
};

export default PayrollChart;
