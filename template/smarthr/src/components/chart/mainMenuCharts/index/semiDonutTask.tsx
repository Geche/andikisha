"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SemiDonutTask() {
  const [semidonutData, setSemidonutData] = useState<ChartData<"doughnut">>();
  const [semidonutOptions, setSemidonutOptions] =
    useState<ChartOptions<"doughnut">>();

  useEffect(() => {
    const data: ChartData<"doughnut"> = {
      labels: ["Ongoing", "Onhold", "Completed", "Overdue"],
      datasets: [
        {
          label: "Tasks",
          data: [20, 40, 20, 10],
          backgroundColor: ["#FFC107", "#1B84FF", "#03C95A", "#E70D0D"],
          borderColor: "#fff",
          borderWidth: 3
        },
      ],
    };

    const options: ChartOptions<"doughnut"> = {
      rotation: -100, // where to start
      circumference: 185, // how much of circle
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      cutout: "75%", // thickness of donut
      spacing: 4, // space between arcs,
      elements: {
        arc: {
          borderRadius: 20, // rounded edges
        },
      },
    };

    setSemidonutData(data);
    setSemidonutOptions(options);
  }, []);

  return (
    <div className="h-64 w-full">
      {semidonutData && semidonutOptions && (
        <Doughnut data={semidonutData} options={semidonutOptions} />
      )}
    </div>
  );
}
