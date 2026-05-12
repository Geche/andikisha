"use client";

import React from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const DonutChartThree: React.FC = () => {
  const series = [15, 10, 5, 10, 60];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 290,
      toolbar: { show: false },
    },

    labels: ["Paid", "Google", "Referals", "Campaigns", "Campaigns"],

    colors: ["#F26522", "#FFC107", "#E70D0D", "#1B84FF", "#0C4B5E"],

    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Leads",
              formatter: () => "589",
            },
          },
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
  };

  return (
    <div id="donut-chart-3">
      <ApexChart
        options={options}
        series={series}
        type="donut"
        height={290}
      />
    </div>
  );
};

export default DonutChartThree;
