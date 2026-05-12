"use client";
import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Plugin
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// 🔥 Center Text Plugin
const centerTextPlugin: Plugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const value = "$2,458,900";

    ctx.save();
    ctx.font = "600 12px Arial";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const x = (chartArea.left + chartArea.right) / 2;
    const y = chartArea.bottom - 50;

    ctx.fillText(value, x, y);
    ctx.restore();
  }
};

const CostChart: React.FC = () => {
  const data = {
    labels: [
      "Salaries",
      "Benefits",
      "Bonuses",
      "Overtime",
      "Training",
      "Incentives"
    ],
    datasets: [
      {
        label: "Semi Donut",
        data: [40, 10, 10, 20, 10, 10],
        backgroundColor: [
          "#0C4B5E",
          "#618B98",
          "#7298A4",
          "#84A5AF",
          "#95B2BB",
          "#A7BFC6"
        ],
        borderWidth: 5,
        borderRadius: 10,
        borderColor: "#fff",
        hoverBorderWidth: 0
      }
    ]
  };

  const options = {
    rotation: -90,
    circumference: 180,
    cutout: "80%",
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: -20, bottom: -20 }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  return (
    <div style={{ height: 180 }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default CostChart;
