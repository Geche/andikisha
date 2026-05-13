"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TicketStatusChart: React.FC = () => {
  const series = [72, 55, 38, 22];

  const options: ApexOptions = {
    chart: {
      height: 296,
      type: "radialBar",
      sparkline: { enabled: true },
    },

    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 240,

        hollow: {
          size: "18%",
        },

        track: {
          background: "#f2f2f2",
          strokeWidth: "100%",
          opacity: 1,
          margin: 6,
        },

        dataLabels: {
          show: false,
        },
      },
    },

    stroke: {
      lineCap: "round",
    },

    colors: [
      "#F26522", // Open
      "#1B84FF", // In Progress
      "#FFC107", // On Hold
      "#AB47BC", // Closed
    ],

    labels: ["Open", "In Progres", "On Hold", "Closed"],
  };

  return (
    <div id="ticket-status">
      <Chart options={options} series={series} type="radialBar" height={296} />
    </div>
  );
};

export default TicketStatusChart;
