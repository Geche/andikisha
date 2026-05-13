"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AssetsDepartmentChart: React.FC = () => {
  const series = [
    {
      name: "Employee",
      data: [80, 110, 80, 20],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 296,
      type: "bar",
      toolbar: { show: false },
    },

    colors: ["#0C4B5E"],

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: 0,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: true,
        barHeight: "85%",
        borderRadiusApplication: "end", // modern Apex rounding
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: ["HR", "Finance", "Operations", "Sales"],
      labels: {
        style: {
          colors: "#111827",
          fontSize: "13px",
        },
      },
    },
  };

  return (
    <div id="assets-department">
      <Chart options={options} series={series} type="bar" height={296} />
    </div>
  );
};

export default AssetsDepartmentChart;
