"use client";
import React from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);
import { ApexOptions } from "apexcharts";

const SlaComplianceChart: React.FC = () => {
  const series = [80.5];

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 230,
      sparkline: { enabled: true },
    },

    colors: ["#F26522"],

    plotOptions: {
      radialBar: {
        startAngle: -110,
        endAngle: 250,

        hollow: {
          size: "62%",
        },

        track: {
          background: "#E5E7EB",
          strokeWidth: "100%",
        },

        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "24px",
            fontWeight: 600,
            color: "#1F2937",
            offsetY: 0,
            formatter: (val: number) => `${val.toFixed(1)}%`,
          },
        },
      },
    },

    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div id="sla-compliance">
      <Chart options={options} series={series} type="radialBar" height={230} />
    </div>
  );
};

export default SlaComplianceChart;
