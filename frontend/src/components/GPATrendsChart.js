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
  const [visibleDatasets, setVisibleDatasets] = React.useState({});

  const colors = [
    '#be123c', '#b45309', '#a16207', '#16a34a', '#2563eb',
    '#7e22ce', '#0d9488', '#f97316', '#dc2626', '#22c55e'
  ];

  // Theme colors
  const gridColor = isDarkMode ? '#3f3f46' : '#d1d5db';
  const textColor = isDarkMode ? '#e7e5e4' : '#000000';

  const allDatasets = useMemo(() => {
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

    return datasets;
  }, [teachers, timePeriods]);

  // Initialize all datasets as visible
  React.useEffect(() => {
    if (allDatasets.length > 0 && Object.keys(visibleDatasets).length === 0) {
      const initialVisibility = {};
      allDatasets.forEach((dataset, index) => {
        initialVisibility[index] = true;
      });
      setVisibleDatasets(initialVisibility);
    }
  }, [allDatasets]);

  const chartData = useMemo(() => {
    if (!allDatasets || allDatasets.length === 0) return null;

    const periods = [...timePeriods].reverse();
    const datasets = allDatasets.map((dataset, index) => ({
      ...dataset,
      borderColor: visibleDatasets[index] ? dataset.borderColor : (isDarkMode ? '#4a5568' : '#d1d5db'),
      backgroundColor: visibleDatasets[index] ? dataset.backgroundColor : (isDarkMode ? '#4a5568' : '#d1d5db'),
      borderWidth: visibleDatasets[index] ? 2 : 1,
      pointRadius: visibleDatasets[index] ? 3 : 2
    }));

    return {
      labels: periods,
      datasets: datasets
    };
  }, [allDatasets, visibleDatasets, timePeriods, isDarkMode]);

  const toggleDataset = (index) => {
    setVisibleDatasets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAll = () => {
    // Check if most are visible
    const visibleCount = Object.values(visibleDatasets).filter(v => v).length;
    const shouldHideAll = visibleCount > allDatasets.length / 2;

    const newState = {};
    allDatasets.forEach((_, index) => {
      newState[index] = !shouldHideAll;
    });
    setVisibleDatasets(newState);
  };

  // Determine button text based on current state
  const visibleCount = Object.values(visibleDatasets).filter(v => v).length;
  const toggleAllText = visibleCount > allDatasets.length / 2 ? 'Hide All' : 'Show All';

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    clip: false,
    animation: false,
    animations: {
      colors: {
        duration: 300
      },
      x: {
        duration: 0
      },
      y: {
        duration: 0
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 0
        }
      },
      resize: {
        animation: {
          duration: 0
        }
      },
      show: {
        animations: {
          x: {
            from: 0,
            duration: 0
          },
          y: {
            from: 0,
            duration: 0
          }
        }
      },
      hide: {
        animations: {
          x: {
            to: 0,
            duration: 0
          },
          y: {
            to: 0,
            duration: 0
          }
        }
      }
    },
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
        display: false
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
      <style jsx>{`
        .custom-legend {
          max-height: 295px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px;
          width: 150px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 11px;
        }
        .legend-item:hover {
          opacity: 0.8;
        }
        .legend-item.hidden {
          opacity: 0.4;
        }
        .legend-color {
          width: 20px;
          height: 3px;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .legend-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .legend-buttons {
          display: flex;
          gap: 8px;
          padding: 10px 10px 5px 10px;
          border-top: 1px solid;
        }
        .legend-button {
          flex: 1;
          padding: 6px 12px;
          font-size: 11px;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
          text-align: center;
        }
        .legend-button:hover {
          opacity: 0.8;
        }
      `}</style>
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-beige-light">
          GPA Trends Over Time
        </h2>
        <p className="text-sm text-beige-dark mt-1">
          Historical GPA data for all teachers
        </p>
      </div>
      <div className="p-6">
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, height: '400px' }}>
            <Line data={chartData} options={options} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '360px', marginTop: '15px' }}>
            <div className="custom-legend" style={{ color: textColor, flex: '0 1 auto' }}>
              {allDatasets.map((dataset, index) => (
                <div
                  key={index}
                  className={`legend-item ${!visibleDatasets[index] ? 'hidden' : ''}`}
                  title={dataset.label}
                  onClick={() => toggleDataset(index)}
                >
                  <div
                    className="legend-color"
                    style={{ backgroundColor: dataset.borderColor }}
                  />
                  <span className="legend-label">{dataset.label}</span>
                </div>
              ))}
            </div>
            <div
              className="legend-buttons"
              style={{
                borderTopColor: gridColor,
                marginTop: '12px'
              }}
            >
              <button
                className="legend-button"
                onClick={toggleAll}
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                  color: textColor,
                  border: `1px solid ${gridColor}`
                }}
              >
                {toggleAllText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPATrendsChart;
