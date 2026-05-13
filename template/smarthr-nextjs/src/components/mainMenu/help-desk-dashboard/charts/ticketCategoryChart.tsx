"use client";
import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const TicketCategoryChart: React.FC = () => {
  const data = {
    labels: ["IT Support", "HR", "Payroll", "Access", "Hardware", "Other"],
    datasets: [
      {
        data: [30, 12, 10, 18, 8, 12],
        backgroundColor: [
          "#F68B4A",
          "#6E8F99",
          "#45C676",
          "#F2BE1A",
          "#4C8DFF",
          "#E53935",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        borderRadius: 8,
        spacing: 1,
      },
    ],
  };

  const options = {
    rotation: -90,
    circumference: 180,
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: { display: false },

      tooltip: {
        enabled: true,
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "220px" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default TicketCategoryChart;
