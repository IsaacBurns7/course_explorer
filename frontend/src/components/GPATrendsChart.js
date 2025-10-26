import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useTheme } from '../context/theme';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GPATrendsChart = ({ teachers, timePeriods }) => {
  const { isDarkMode } = useTheme();

  const colors = [
    '#be123c', '#b45309', '#a16207', '#16a34a', '#2563eb',
    '#7e22ce', '#0d9488', '#f97316', '#dc2626', '#22c55e'
  ];

  // Theme colors
  const gridColor = isDarkMode ? '#3f3f46' : '#d1d5db';
  const textColor = isDarkMode ? '#e7e5e4' : '#000000';

  const chartData = useMemo(() => {
    if (!teachers || teachers.length === 0 || !timePeriods || timePeriods.length === 0) return null;

    // Reverse periods to show most recent on the left
    const periods = [...timePeriods].reverse();

    const datasets = teachers.map((teacher, index) => {
      if (!teacher.gpaHistory || typeof teacher.gpaHistory !== 'object') return null;

      const data = periods.map(period => {
        const termGpas = teacher.gpaHistory[period];
        if (!termGpas || termGpas.length === 0) return null;
        return termGpas.reduce((a, b) => a + b, 0) / termGpas.length;
      });

      // Skip if all values are null
      if (data.every(v => v === null)) return null;

      const lastName = (teacher.name || 'Unknown').split(' ').pop();
      const color = colors[index % colors.length];

      return {
        label: lastName,
        data: data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: false,
        tension: 0, // make lines straight (0 = linear)
        clip: false // don't clip points at edges
      };
    }).filter(Boolean);

    return {
      labels: periods,
      datasets: datasets
    };
  }, [teachers, timePeriods]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    clip: false,
    layout: {
      padding: {
        top: 15,
        bottom: 15,
        left: 10,
        right: 10
      }
    },
    interaction: {
      mode: 'point', // Only show tooltip for the exact point being hovered
      intersect: true
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const teacherName = context.dataset.label;
            const gpa = context.parsed.y;
            return `${teacherName}: ${gpa !== null ? gpa.toFixed(2) : 'N/A'}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 30,
          font: {
            size: 12
          }
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 4,
        ticks: {
          stepSize: 0.5,
          color: textColor,
          font: {
            size: 12
          }
        },
        grid: {
          color: gridColor,
          drawBorder: true,
          lineWidth: 1
        },
        border: {
          display: true,
          width: 2
        },
        title: {
          display: true,
          text: 'GPA',
          color: textColor,
          font: {
            size: 14
          }
        }
      }
    }
  }), [isDarkMode, textColor, gridColor]);

  if (!chartData || chartData.datasets.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-beige-light">
          GPA Trends Over Time
        </h2>
        <p className="text-sm text-beige-dark mt-1">
          Historical GPA data for all teachers
        </p>
      </div>
      <div className="p-6">
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default GPATrendsChart;
