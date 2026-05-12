"use client";

import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DonutChartTwo: React.FC = () => {
  const series = [25, 30, 10, 35];

  const options: ApexOptions = {
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
      show: true,
      width: 0, // gap between donut sections
      colors: ["#fff"],
      lineCap: "round",
    },

    legend: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div id="donut-chart-2">
      <ApexChart
        options={options}
        series={series}
        type="donut"
        height={185}
      />
    </div>
  );
};

export default DonutChartTwo;
