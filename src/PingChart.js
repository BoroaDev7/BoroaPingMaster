import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PingChart = ({ pingData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const latencyData = pingData.map(data => data.latency);
    const packetLossData = pingData.map(data => data.packetLoss ? 0 : null);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: pingData.map((_, index) => index + 1),
        datasets: [
          {
            label: 'Latencia (ms)',
            data: latencyData,
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Pérdida de Paquetes',
            data: packetLossData,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderWidth: 2,
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: packetLossData.map(value => value === 0 ? 'red' : 'transparent'),
            pointBorderColor: 'transparent',
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Número de Pings',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Latencia (ms)',
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [pingData]);

  return (
    <canvas ref={chartRef}></canvas>
  );
};

export default PingChart;
