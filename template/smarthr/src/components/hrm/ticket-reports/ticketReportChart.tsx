import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TicketReportChart: React.FC = () => {
  const series: ApexOptions["series"] = [
    {
      name: "Access Issue",
      data: [
        { x: "Critical", y: 80 },
        { x: "High", y: 70 },
        { x: "Medium", y: 20 },
        { x: "Low", y: 15 },
      ],
    },
    {
      name: "Module Issue",
      data: [
        { x: "Critical", y: 15 },
        { x: "High", y: 30 },
        { x: "Medium", y: 35 },
        { x: "Low", y: 65 },
      ],
    },
    {
      name: "Billing & Payments",
      data: [
        { x: "Critical", y: 20 },
        { x: "High", y: 65 },
        { x: "Medium", y: 60 },
        { x: "Low", y: 30 },
      ],
    },
    {
      name: "Integration Issues",
      data: [
        { x: "Critical", y: 15 },
        { x: "High", y: 70 },
        { x: "Medium", y: 30 },
        { x: "Low", y: 20 },
      ],
    },
    {
      name: "Subscription Issues",
      data: [
        { x: "Critical", y: 30 },
        { x: "High", y: 75 },
        { x: "Medium", y: 70 },
        { x: "Low", y: 35 },
      ],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "heatmap",
      height: 260,
      toolbar: { show: false },
    },

    plotOptions: {
      heatmap: {
        radius: 6,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            { from: 0, to: 20, color: "#E9EFF2" },
            { from: 21, to: 40, color: "#C9D9DF" },
            { from: 41, to: 60, color: "#9FBAC4" },
            { from: 61, to: 100, color: "#6F97A4" },
          ],
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 4,
      colors: ["#ffffff"],
    },

    xaxis: {
      labels: {
        style: {
          fontSize: "13px",
          colors: "#6B7280",
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          fontSize: "13px",
          colors: "#6B7280",
        },
      },
    },

    grid: {
      show: false,
    },

    legend: {
      show: false,
    },

    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `Tickets: ${val}`,
      },
    },
  };

  return (
    <div id="ticket-report">
      <ReactApexChart
        options={options}
        series={series}
        type="heatmap"
        height={260}
      />
    </div>
  );
};

export default TicketReportChart;
