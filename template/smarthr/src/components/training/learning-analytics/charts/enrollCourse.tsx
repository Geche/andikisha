import React from "react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const EnrollCourseChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Skill Level",
      data: [35, 55, 40, 15, 25, 45], // Git, HTML, Nodejs, MySQL, React, Java
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "35%",
        borderRadius: 8,
        distributed: false,
      },
    },

    colors: ["#F26522"],

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: ["Git", "HTML", "Nodejs", "MySQL", "React", "Java"],
      min: 0,
      max: 60,
      tickAmount: 6,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#111827",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      xaxis: {
        lines: { show: true },
      },
      yaxis: {
        lines: { show: false },
      },
    },

    tooltip: {
      y: {
        formatter: (val: number) => `${val} hrs`,
      },
    },
  };

  return (
    <div id="enroll-course">
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
};

export default EnrollCourseChart;
