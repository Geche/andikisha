import React from "react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const LearnEmployeeChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Inprogress",
      type: "column",
      data: [50, 70, 60, 180, 120, 90, 140, 80, 130, 100, 90, 75],
    },
    {
      name: "Completed",
      type: "column",
      data: [90, 130, 170, 260, 150, 130, 180, 220, 200, 280, 240, 300],
    },
    {
      name: "Total Employees",
      type: "line",
      data: [140, 200, 260, 460, 310, 260, 370, 340, 370, 420, 350, 430],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 320,
      type: "line",
      stacked: true,
      toolbar: { show: false },
    },

    stroke: {
      width: [0, 0, 3],
      curve: "smooth",
    },

    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 6,
      },
    },

    markers: {
      size: 6,
      strokeWidth: 3,
      hover: { size: 7 },
    },

    colors: ["#FF7A45", "#0B3C49", "#FFC107"],

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
    },

    yaxis: {
      min: 0,
      max: 500,
      tickAmount: 5,
    },

    legend: {
      position: "bottom",
    },

    grid: {
      strokeDashArray: 4,
    },

    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  return (
    <div id="learn-employee">
      <Chart options={options} series={series} type="line" height={320} />
    </div>
  );
};

export default LearnEmployeeChart;
