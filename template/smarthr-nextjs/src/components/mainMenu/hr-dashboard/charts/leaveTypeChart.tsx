"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const LeaveTypeChart: React.FC = () => {
  const series = [85, 50, 20]; // Sick, Casual, Unpaid

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      width: 150,
      height: 150,
      sparkline: {
        enabled: true,
      },
    },

    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 0,
        hollow: {
          margin: 0,
          size: "40%",
          background: "transparent",
        },
        track: {
          show: true,
          background: "#F3F4F6",
          strokeWidth: "97%",
          margin: 5,
        },
        dataLabels: {
          show: false,
        },
      },
    },

    fill: {
      colors: ["#F37438", "#F5844E", "#F69364"],
    },

    labels: ["Sick", "Casual", "Unpaid"],

    grid: {
      padding: {
        top: -50,
        left: -10,
        bottom: -150,
      },
    },

    legend: {
      show: false,
    },
  };

  return (
    <div id="leave-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        width={150}
        height={150}
      />
    </div>
  );
};

export default LeaveTypeChart;
