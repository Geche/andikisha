"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const EmployeeDistributionChart: React.FC = () => {
  const series = [
    {
      name: "Company",
      data: [40, 20, 35, 10],
    },
  ];

  const options: ApexOptions = {
    colors: ["#FF7129"],

    chart: {
      height: 340,
      type: "bar",
      toolbar: {
        show: false,
      },
    },

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#FF7129",
            opacity: 0.5,
          },
          {
            offset: 100,
            color: "#FFFFFF",
            opacity: 0.5,
          },
        ],
      },
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetY: 10,
          },
        },
      },
    ],

    plotOptions: {
      bar: {
        columnWidth: "90%",
        borderRadius: 10,
        borderRadiusWhenStacked: "all",
        horizontal: false,
        dataLabels: {
          position: "bottom",
        },
        colors: {
          backgroundBarColors: ["#F8F9FA"],
          backgroundBarOpacity: 0.5,
          backgroundBarRadius: 10,
        },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: 10,
      style: {
        fontSize: "12px",
        colors: ["#111827"],
        fontWeight: "bold",
      },
    },

    xaxis: {
      categories: ["Sales", "Front End", "React", "UI"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#111827",
          fontSize: "13px",
        },
      },
    },

    yaxis: {
      min: 0,
      max: 50,
      labels: {
        show: false,
      },
    },

    grid: {
      show: false,
      strokeDashArray: 5,
      padding: {
        left: -10,
        right: -30,
        bottom: -10,
      },
    },

    legend: {
      show: false,
    },
  };

  return (
    <div id="employee-distribution">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={340}
      />
    </div>
  );
};

export default EmployeeDistributionChart;
