"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

const RecruitmentChart = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const totalSegments = 15;
    const filledSegments = 7;

    const data = Array(totalSegments).fill(1);
    const colors = data.map((_, i) =>
      i < filledSegments ? "#FF7028" : "#F3F4F6"
    );

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 0,
            borderRadius: 12,
            spacing: 10,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -110,
        circumference: 220,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ height: 160 }}>
      <canvas id="recruitment" ref={canvasRef} />
    </div>
  );
};

export default RecruitmentChart;
