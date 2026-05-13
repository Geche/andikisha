"use client";

import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const PerformanceChart2 = () => {
  const [performanceChart2] = useState<{ options: ApexOptions; series: any[] }>({
    series: [
      {
        name: "performance",
        data: [20, 20, 35, 35, 40, 60, 60],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 288,
        zoom: {
          enabled: false,
        },
      },
      colors: ["#03C95A"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      title: {
        text: "",
        align: "left",
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => `${val}K`,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
    },
  });

  return (
    <div className="w-full">
      <ReactApexChart
        options={performanceChart2.options}
        series={performanceChart2.series}
        type="area"
        height={288}
      />
    </div>
  );
};

export default PerformanceChart2;
