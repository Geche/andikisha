"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const AttendanceTrendChart: React.FC = () => {
  const series = [
    {
      name: "Attendance",
      data: [40, 22, 53, 25, 56, 90, 43, 25, 68, 80, 35, 20]
    }
  ];

  const options: ApexOptions = {
    chart: {
      height: 375,
      type: "bar",
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 6,
        borderRadiusApplication: "around",
        distributed: true,
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 1,
          backgroundBarRadius: 6
        }
      }
    },
    colors: [
      "#F4CACB", "#F4CACB", "#F4CACB", "#F4CACB", "#F4CACB",
      "#E70D0D", // June
      "#F4CACB", "#F4CACB", "#F4CACB", "#F4CACB", "#F4CACB", "#F4CACB"
    ],
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 1,
        opacityTo: 1,
        colorStops: [
          ...Array(5).fill([
            { offset: 0, color: "#F4CACB", opacity: 1 },
            { offset: 100, color: "#FDE0D3", opacity: 1 }
          ]),
          [
            { offset: 0, color: "#E70D0D", opacity: 1 },
            { offset: 100, color: "#F26522", opacity: 1 }
          ],
          ...Array(6).fill([
            { offset: 0, color: "#F4CACB", opacity: 1 },
            { offset: 100, color: "#FDE0D3", opacity: 1 }
          ])
        ]
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) =>
        opts.dataPointIndex === 5 ? `${val}%` : "",
      offsetY: -22,
      style: {
        fontSize: "12px",
        fontWeight: 500,
        colors: ["#fff"]
      },
      background: {
        enabled: true,
        foreColor: "#fff",
        padding: 5,
        borderRadius: 8,
        backgroundColor: "#1F2937",
        borderWidth: 0
      }
    },
    xaxis: {
      categories: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        offsetY: -20,
        style: {
          colors: [
            "#374151","#374151","#374151","#374151","#374151",
            "#FFFFFF",
            "#374151","#374151","#374151","#374151","#374151","#374151"
          ],
          fontSize: "13px",
          fontWeight: 500
        }
      }
    },
    yaxis: {
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val) => `${val}%`,
        style: {
          fontSize: "13px",
          fontWeight: 500,
          colors: "#6B7280"
        }
      }
    },
    grid: {
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      padding: { top: 0, bottom: -30, right: -5 }
    },
    legend: {
      show: false
    }
  };

  return (
    <div id="attendancetrend-chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={375}
      />
    </div>
  );
};

export default AttendanceTrendChart;
