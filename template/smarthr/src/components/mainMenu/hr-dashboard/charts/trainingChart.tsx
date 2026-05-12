"use client";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from "chart.js";
import { FC } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

// 🔥 Center Text Plugin
const centerTextPlugin: Plugin<"doughnut"> = {
  id: "centerText",
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const value = "20%";

    ctx.save();
    ctx.font = "600 12px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.fillText(value, x, y);
    ctx.restore();
  },
};

const data = {
  labels: ["Training", "Completed"],
  datasets: [
    {
      label: "Semi Donut",
      data: [80, 20],
      backgroundColor: ["#fff", "#F26522"],
      borderWidth: 2,
      borderRadius: 10,
      borderColor: "#3B7080",
      hoverBorderWidth: 0,
      cutout: "60%",
    },
  ],
};

const options: ChartOptions<"doughnut"> = {
  rotation: -90,
  circumference: 360,
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: -20,
      bottom: -20,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

const TrainingChart: FC = () => {
  return (
    <div style={{ width: "50px", height: "50px", position: "relative" }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
};

export default TrainingChart;
