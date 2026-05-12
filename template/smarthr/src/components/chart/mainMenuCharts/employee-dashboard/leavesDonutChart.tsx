"use client";

import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const LeavesDonutChart = () => {
  const [leavesChart] = useState<{ options: ApexOptions; series: number[] }>({
    options: {
      chart: {
        type: 'donut',
        height: 165,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%', // Adjust donut size
          },
        },
      },
      labels: ['Sick Leave', 'Casual Leave', 'Absent', 'Permission', 'Present'], // optional
      dataLabels: {
        enabled: false,
      },
      colors: ['#F26522', '#FFC107', '#E70D0D', '#03C95A', '#0C4B5E'],
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { show: false },
          },
        },
      ],
    },
    series: [15, 10, 5, 10, 60],
  });

  return (
    <div className="w-full">
      <ReactApexChart
        options={leavesChart.options}
        series={leavesChart.series}
        type="donut"
        height={165}
      />
    </div>
  );
};

export default LeavesDonutChart;
