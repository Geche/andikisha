
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import dynamic from "next/dynamic";
import React from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Dynamically import Doughnut
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  { ssr: false }
);


const DealChart: React.FC = () => {
  const data = {
    labels: ["Email", "Chat", "Sales"],
    datasets: [
      {
        data: [45, 25, 30],
        backgroundColor: [
          "#3f6f7f", // blue
          "#ffc107", // yellow
          "#ff6a2c", // orange
        ],
        borderWidth: 0,
        borderRadius: 20, // rounded arc ends
        spacing: 6, // gap between segments
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div style={{ width: "299px", height: "200px" }} className="mx-auto mb-3">
      <Doughnut data={data} options={options} width={299} height={200} />
    </div>
  );
};

export default DealChart;
