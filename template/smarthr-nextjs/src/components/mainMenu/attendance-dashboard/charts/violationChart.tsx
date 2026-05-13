"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

interface ViolationMiniChartProps {
  values?: number[];
}

const ViolationMiniChart: React.FC<ViolationMiniChartProps> = ({
  values = [90, 50, 75]
}) => {
  const series: ApexAxisChartSeries = [
    {
      name: "Company",
      data: values
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 120,
      width: 150,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },

    colors: ["#FF5504", "#47BCB2", "#EFCE6B"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        colorStops: [
          [
            { offset: 0, color: "#F37438", opacity: 1 },
            { offset: 100, color: "#FF5504", opacity: 1 }
          ],
          [
            { offset: 0, color: "#0C4B5E", opacity: 1 },
            { offset: 100, color: "#47BCB2", opacity: 1 }
          ],
          [
            { offset: 0, color: "#2DA17C", opacity: 1 },
            { offset: 100, color: "#EFCE6B", opacity: 1 }
          ]
        ]
      }
    },

    plotOptions: {
      bar: {
        columnWidth: "70%",
        distributed: true,
        borderRadius: 5,
        borderRadiusApplication: "around",
        dataLabels: {
          position: "top"
        }
      }
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: -20,
      style: {
        fontSize: "12px",
        fontWeight: 700,
        colors: ["#333"]
      }
    },

    xaxis: {
      categories: ["Sales", "Front End", "React"],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: {
      min: 0,
      max: 110,
      labels: { show: false }
    },

    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },

    legend: { show: false }
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={120}
      width={150}
    />
  );
};

export default ViolationMiniChart;
