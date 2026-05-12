"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Plugin,
} from "chart.js";
import { Line } from "react-chartjs-2";

// 🔥 IMPORT IMAGES (adjust path if needed)
import user1 from "../../../../../public/assets/img/users/user-01.jpg";
import user5 from "../../../../../public/assets/img/users/user-05.jpg";
import user3 from "../../../../../public/assets/img/users/user-03.jpg";
import user4 from "../../../../../public/assets/img/users/user-04.jpg";
import user2 from "../../../../../public/assets/img/users/user-02.jpg";
import user6 from "../../../../../public/assets/img/users/user-06.jpg";
import user7 from "../../../../../public/assets/img/users/user-07.jpg";
import user8 from "../../../../../public/assets/img/users/user-08.jpg";
import user30 from "../../../../../public/assets/img/users/user-30.jpg";
import user27 from "../../../../../public/assets/img/users/user-27.jpg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const imageSources = [user1, user5, user3, user4, user2, user6, user7, user8, user30, user27];

const labels = [
  "Micheal",
  "Martinz",
  "Clark",
  "Hensrita",
  "Lisa",
  "Davis",
  "Anderson",
  "James",
  "Merkel",
  "Daniel",
];

const chartData = [100, 95, 100, 100, 100, 70, 45, 78, 75, 80];

const ImagePointChart: React.FC = () => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // 🔄 Preload images
  useEffect(() => {
    const loaded: HTMLImageElement[] = [];
    let count = 0;

    imageSources.forEach((src, i) => {
      const img = new Image();
      img.src = src.src;
      img.onload = () => {
        count++;
        loaded[i] = img;
        if (count === imageSources.length) {
          setImages(loaded);
        }
      };
    });
  }, []);

  // 🖼 Avatar plugin
  const imageLabelsPlugin: Plugin<"line"> = {
    id: "imageLabels",
    afterDraw: (chart) => {
      if (!images.length) return;

      const { ctx, chartArea: { bottom }, scales: { x } } = chart;

      ctx.save();

      images.forEach((image, index) => {
        const xPos = x.getPixelForValue(index);
        const size = 24;
        const y = bottom + 10;
        const radius = size / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(xPos, y + radius, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, xPos - radius, y, size, size);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(xPos, y + radius, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.restore();
    },
  };

  // 📏 Vertical bar plugin
  const verticalLinesPlugin: Plugin<"line"> = {
    id: "verticalLines",
    afterDatasetsDraw: (chart) => {
      const { ctx, scales: { x, y } } = chart;

      ctx.save();
      ctx.strokeStyle = "#B9CBD1";
      ctx.lineWidth = 6;

      chart.data.datasets[0].data.forEach((value: any, i: number) => {
        const xPos = x.getPixelForValue(i);
        const yPos = y.getPixelForValue(value);

        ctx.beginPath();
        ctx.moveTo(xPos, yPos + 2);
        ctx.lineTo(xPos, y.getPixelForValue(0));
        ctx.stroke();
      });

      ctx.restore();
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Score",
        data: chartData,
        pointBackgroundColor: "#0C4B5E",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 10, bottom: 30 } },
    scales: {
      y: {
        min: 0,
        max: 110,
        ticks: { stepSize: 25, color: "#9CA3AF" },
        grid: { color: "#F3F4F6" },
      },
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ height: "110px", position: "relative" }}>
      {/* 🔥 key forces redraw after images load */}
      <Line
        key={images.length}
        data={data}
        options={options}
        plugins={[imageLabelsPlugin, verticalLinesPlugin]}
      />
    </div>
  );
};

export default ImagePointChart;
