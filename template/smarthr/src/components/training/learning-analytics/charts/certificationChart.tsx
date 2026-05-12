import React from "react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const CertificationChart: React.FC = () => {
  const series: ApexAxisChartSeries = [
    {
      name: "Performance",
      data: [20, 45, 30, 60, 40, 70, 35, 55, 30, 65],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 230,
      toolbar: { show: false },
      zoom: { enabled: false },
    },

    stroke: {
      curve: "smooth",
      width: 4,
      colors: ["#F26522"],
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#F26522",
            opacity: 0.45,
          },
          {
            offset: 100,
            color: "#FFFFFF",
            opacity: 0,
          },
        ],
      },
    },

    markers: {
      size: 0,
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      labels: { show: false },
    },

    grid: {
      show: false,
    },

    tooltip: {
      enabled: true,
    },
  };

  return (
    <div id="certification-chart">
      <Chart options={options} series={series} type="area" height={230} />
    </div>
  );
};

export default CertificationChart;
