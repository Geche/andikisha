"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SemiDonutCharts() {
  // Attendance Chart
  const [chartData, setChartData] = useState<ChartData<"doughnut">>();
  const [chartOptions, setChartOptions] = useState<ChartOptions<"doughnut">>();

  // Semi Donut Chart (Tasks)
  const [semidonutData, setSemidonutData] = useState<ChartData<"doughnut">>();
  const [semidonutOptions, setSemidonutOptions] =
    useState<ChartOptions<"doughnut">>();

  useEffect(() => {
    // Attendance Chart
    setChartData({
      labels: ["Late", "Present", "Permission", "Absent"],
      datasets: [
        {
          label: "Semi Donut",
          data: [40, 20, 30, 10],
          backgroundColor: ["#0C4B5E", "#03C95A", "#FFC107", "#E70D0D"],
          borderWidth: 5,
          borderRadius: 10,
          borderColor: "#fff",
          hoverBorderWidth: 0,
        },
      ],
    });

    setChartOptions({
      cutout: "60%",
      rotation: -100,
      circumference: 200,
      layout: {
        padding: {
          top: -20,
          bottom: -20,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    });
  }, []);

  useEffect(() => {
    // Tasks Semi Donut Chart
    setSemidonutData({
      labels: ["Ongoing", "Onhold", "Completed", "Overdue"],
      datasets: [
        {
          label: "Semi Donut",
          data: [20, 40, 20, 10],
          backgroundColor: ["#FFC107", "#1B84FF", "#03C95A", "#E70D0D"],
          borderWidth: -10,
          borderColor: "transparent",
          hoverBorderWidth: 0,
          spacing: -30,
        },
      ],
    });

    setSemidonutOptions({
      cutout: "75%",
      rotation: -100,
      circumference: 185,
      layout: {
        padding: {
          top: -20,
          bottom: 20,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      elements: {
        arc: {
          borderWidth: -30,
          borderRadius: 30,
        },
      },
    });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8 w-full">
      {/* Attendance Chart */}
      <div className="h-64 w-full">
        {chartData && chartOptions && (
          <Doughnut data={chartData} options={chartOptions} />
        )}
      </div>

    
    </div>
  );
}
