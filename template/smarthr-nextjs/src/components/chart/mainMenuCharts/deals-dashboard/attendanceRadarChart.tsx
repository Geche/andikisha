"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function AttendanceRadarChart() {
  const [canvaData, setCanvaData] = useState<any | null>(null); // Initialize as null
  const [canvaOptions, setCanvaOptions] = useState<any | null>(null);

  useEffect(() => {
    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      datasets: [
        {
          label: "Email",
          data: [40, 70, 20, 40, 40, 70, 40, 60],
          backgroundColor: "rgba(45, 203, 115, 0.2)",
          borderColor: "#2dcb73",
          pointBackgroundColor: "#2dcb73",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#2dcb73",
          tension: 0.3,
        },
        {
          label: "Chat",
          data: [30, 30, 90, 30, 60, 30, 60, 90],
          backgroundColor: "rgba(75, 48, 136, 0.2)",
          borderColor: "#4b3088",
          pointBackgroundColor: "#4b3088",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#4b3088",
          tension: 0.4,
        },
        {
          label: "Series 3",
          data: [70, 43, 70, 90, 30, 30, 30, 40],
          backgroundColor: "rgba(242, 101, 34, 0.2)",
          borderColor: "#F26522",
          pointBackgroundColor: "#F26522",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#F26522",
          tension: 0.4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true, color: "#e9e9e9" },
          grid: { circular: true },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { stepSize: 30, color: "#6B7280" },
        },
      },
      plugins: {
        legend: { display: true, position: "top" as const },
      },
    };

    setCanvaData(data);
    setCanvaOptions(options);
  }, []);

  // Render only if data and datasets exist
  if (!canvaData?.datasets) return null;

  return (
    <div className="w-full h-80">
      <Radar data={canvaData} options={canvaOptions} />
    </div>
  );
}
