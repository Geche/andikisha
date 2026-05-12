"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TenantStorageChart: React.FC = () => {
  const series: number[] = [0.62, 2.48, 4.34, 1.86, 1.86];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 200,
    },

    labels: ["Database", "Images", "Videos", "Documents", "Audio"],

    colors: ["#FFC107", "#00C2FF", "#0D3C4A", "#1B84FF", "#F26522"],

    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Storage",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return total.toFixed(2) + " GB";
              },
            },
          },
        },
      },
    },

    dataLabels: { enabled: false },
    legend: { show: false },

    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div id="tenant_chart">
      <Chart options={options} series={series} type="donut" height={200} />
    </div>
  );
};

export default TenantStorageChart;
