"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const AvgHireTimeChart = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar"],
        datasets: [
          {
            label: "Applied to Shortlisted",
            data: [2, 4, 3],
            backgroundColor: "#0b4c5f",
            borderColor: "#ffffff",
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 70,
            stack: "stack1"
          },
          {
            label: "Shortlisted",
            data: [1.7, 1.7, 1.7],
            backgroundColor: "#3e6f7c",
            borderColor: "#ffffff",
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 70,
            stack: "stack1"
          },
          {
            label: "Interview to Offer",
            data: [4, 2, 2],
            backgroundColor: "#9fb8bf",
            borderColor: "#ffffff",
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 70,
            stack: "stack1"
          },
          {
            label: "Acceptance",
            data: [3, 7, 5],
            backgroundColor: "#c9d8dc",
            borderColor: "#ffffff",
            borderWidth: 3,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 70,
            stack: "stack1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 11 }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: "#e5e7eb"
            },
            ticks: {
              stepSize: 5,
              font: { size: 11 }
            }
          }
        }
      }
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ height: 260 }}>
      <canvas id="avghiretime" ref={canvasRef} />
    </div>
  );
};

export default AvgHireTimeChart;
