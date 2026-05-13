import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MiniDonutProps {
  value: number;   // numerator
  total: number;   // denominator
  color: string;
}

const MiniDonut: React.FC<MiniDonutProps> = ({ value, total, color }) => {
  const percentage = Math.round((value / total) * 100);

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true }, // removes extra padding
    },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: {
          size: "45%", // similar to innerRadius
        },
        track: {
          background: "rgba(67, 87, 133, .09)", // background ring
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "14px",
            fontWeight: 600,
            offsetY: 5,
            formatter: () => `${value}/${total}`, // show 6/7 style
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <Chart
      options={options}
      series={[percentage]}
      type="radialBar"
      height={80}
      width={80}
    />
  );
};

export default MiniDonut;
