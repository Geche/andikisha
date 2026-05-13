"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const InsuranceChart: React.FC = () => {
  const series = [
    {
      name: "Positive",
      data: [15, 40, 30, 35, 40, 35, 32],
    },
    {
      name: "Negative",
      data: [-15, -40, -30, -35, -40, -35, -32],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 45,
      width: 100,
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },

    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 2,
        colors: {
          backgroundBarColors: ["#F8F9FA", "#F8F9FA", "#F8F9FA", "#F8F9FA", "#F8F9FA"],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 5,
        },
      },
    },

    colors: ["#F26522"], // orange for positive/negative

    grid: { show: false },

    xaxis: { labels: { show: false } },

    yaxis: {
      min: -50,
      max: 50,
      show: false,
    },

    tooltip: { enabled: true },
  };

  return (
    <div id="insurence-chart">
      <ReactApexChart options={options} series={series} type="bar" height={45} width={100} />
    </div>
  );
};

export default InsuranceChart;
