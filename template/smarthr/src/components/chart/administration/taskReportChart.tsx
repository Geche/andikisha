"use client";


import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TaskChart: React.FC = () => {
  const [taskchart] = useState({
    series: [40, 30, 20, 10],
    options: {
      chart: {
        type: 'donut' as const,
        width: 220,
      },
      colors: ['#03C95A', '#0DCAF0', '#FFC107', '#AB47BC'],
      labels: ['Completed', 'Pending', 'Inprogress', 'On Hold'],
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
          donut: {
            size: '80%',
          },
        },
        stroke: {
          show: true,
          width: 10,
          colors: ['#FFFFFF'],
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      annotations: {
        points: [{
          x: 0.5,
          y: 0.5,
          text: '+14%',
          textOffsetX: 0,
          textOffsetY: 0,
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000000',
          },
          background: {
            enabled: true,
            foreColor: '#FFFFFF',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 2,
            opacity: 0.7,
          },
        }],
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            show: false,
          },
        },
      }],
    },
  });

  return (
    <div>
      <Chart
        options={taskchart.options}
        series={taskchart.series}
        type="donut"
        width={taskchart.options.chart.width}
      />
    </div>
  );
};

export default TaskChart;