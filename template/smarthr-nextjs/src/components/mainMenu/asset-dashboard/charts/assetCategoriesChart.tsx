"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AssetCategoriesChart: React.FC = () => {
  const series = [40, 20, 15, 15, 5];

  const options: ApexOptions = {
    chart: {
      type: "pie",
      height: 290,
    },

    labels: ["Laptops", "Mouse", "Writing Pad", "Keyboard", "Chairs"],

    colors: [
      "#3B7080",
      "#7fa2ad",
      "#9fb9c2",
      "#b7ccd3",
      "#d3e1e6",
    ],

    legend: { show: false },

    dataLabels: { enabled: false },

    stroke: {
      width: 0,
    },
  };

  return (
    <div id="asset-categories-chart">
      <Chart options={options} series={series} type="pie" height={290} />
    </div>
  );
};

export default AssetCategoriesChart;
