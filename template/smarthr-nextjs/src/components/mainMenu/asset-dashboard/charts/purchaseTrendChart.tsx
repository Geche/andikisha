"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const PurchaseTrendChart: React.FC = () => {
  const series = [
    {
      name: "Sales",
      data: [1800, 2600, 4500, 7600, 6900, 7600, 6200, 8000, 7300, 5400, 6000, 5400],
    },
  ];

  const options: ApexOptions = {
    chart: {
      height: 253,
      type: "area",
      toolbar: { show: false },
    },

    stroke: {
      curve: "stepline",
      width: 2,
      colors: ["#FF6F28"],
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#FF6F28",
            opacity: 0.35,
          },
          {
            offset: 100,
            color: "#FF6F28",
            opacity: 0.05,
          },
        ],
      },
    },

    markers: {
      size: 0,
    },

    xaxis: {
      categories: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec",
      ],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      min: 0,
      max: 8000,
      tickAmount: 4,
      forceNiceScale: true,
      labels: {
        formatter: (val: number) => `${Math.round(val / 1000)}K`,
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
        offsetX: -15,
      },
    },

    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 5,
      padding: { left: 0 },
    },

    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        if (dataPointIndex === -1) return "";

        const value = series[seriesIndex][dataPointIndex];
        const formatted = (value / 1000).toFixed(1) + "K";

        return `
          <div style="
            background:#000;
            color:#fff;
            padding:6px 10px;
            border-radius:6px;
            font-size:12px;">
            ${formatted}
          </div>
        `;
      },
    },

    annotations: {
      xaxis: [
        {
          x: "Jun",
          borderColor: "#FF6F28",
          fillColor: "#FF6F28",
          opacity: 1,
          label: {
            text: "7.6K",
            position: "top",
            offsetY: -8,
            style: {
              background: "#000",
              color: "#fff",
              fontSize: "12px",
              padding: {
                left: 8,
                right: 8,
                top: 4,
                bottom: 4,
              },
            },
          },
        },
      ],
    },

    legend: { show: false },
    dataLabels: { enabled: false },
  };

  return (
    <div id="purchase-trend">
      <Chart options={options} series={series} type="area" height={253} />
    </div>
  );
};

export default PurchaseTrendChart;
