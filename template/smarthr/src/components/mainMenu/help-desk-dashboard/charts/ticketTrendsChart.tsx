"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const TicketTrendsChart: React.FC = () => {
  const series = [
    { name: "Created", data: [45, 60, 95, 70, 75, 60, 75] },
    { name: "Resolved", data: [145, 155, 185, 145, 145, 170, 170] },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 241,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "'Public Sans', sans-serif",
    },

    colors: ["#F26522", "#0D4C63"],

    stroke: {
      curve: "straight",
      width: 1.5,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },

    markers: {
      size: 4,
      colors: ["#F26522", "#0D4C63"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },

    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
      padding: { right: -8 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },

    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        offsetX: 2,
        style: {
          colors: [
            "#8e94a9",
            "#8e94a9",
            "#8e94a9",
            "#F26522", // Highlight Thu
            "#8e94a9",
            "#8e94a9",
            "#8e94a9",
          ],
          fontSize: "13px",
        },
      },
    },

    yaxis: {
      min: 0,
      max: 400,
      tickAmount: 4,
      labels: {
        offsetX: -15,
        style: {
          colors: "#8e94a9",
          fontSize: "13px",
        },
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex }) => {
        return `
          <div class="custom-apex-tooltip shadow-sm">
            <div class="tooltip-title">September</div>
            <div class="tooltip-row">
              <div class="tooltip-col">
                <span class="label"><span class="dot orange"></span> Created</span>
                <span class="value">${series[0][dataPointIndex]}</span>
              </div>
              <div class="tooltip-col">
                <span class="label"><span class="dot blue"></span> Resolved</span>
                <span class="value">${series[1][dataPointIndex]}</span>
              </div>
            </div>
          </div>
        `;
      },
    },

    legend: { show: false },
    dataLabels: { enabled: false },
  };

  return (
    <div id="ticket-trends">
      <Chart options={options} series={series} type="area" height={241} />
    </div>
  );
};

export default TicketTrendsChart;
