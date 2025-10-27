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
  const [legendPage, setLegendPage] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        pointHoverRadius: 3,
        pointBorderWidth: 0,
        pointHoverBorderWidth: 4,
        pointHoverBorderColor: color + '60',
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
      pointRadius: 3
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
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const xIndex = elements[0].index;
        const datasetIndex = elements[0].datasetIndex;

        // Get the GPA value at the clicked point
        const clickedGPA = allDatasets[datasetIndex].data[xIndex];

        // Find all datasets with similar GPA at this x position (within 0.05 range)
        const threshold = 0.05;
        const datasetsWithSimilarGPA = [];
        allDatasets.forEach((dataset, idx) => {
          const gpa = dataset.data[xIndex];
          if (gpa !== null && gpa !== undefined && Math.abs(gpa - clickedGPA) <= threshold) {
            datasetsWithSimilarGPA.push(idx);
          }
        });

        // Toggle all datasets with similar GPA at this position
        setVisibleDatasets(prev => {
          const newState = { ...prev };
          // Determine if we should hide or show (based on the clicked dataset's state)
          const shouldHide = prev[datasetIndex];
          datasetsWithSimilarGPA.forEach(index => {
            newState[index] = !shouldHide;
          });
          return newState;
        });
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
          },
          labelColor: function(context) {
            const datasetIndex = context.datasetIndex;
            const originalColor = allDatasets[datasetIndex].borderColor;
            const isVisible = visibleDatasets[datasetIndex];

            if (isVisible) {
              return {
                backgroundColor: originalColor,
                borderColor: originalColor,
                borderWidth: 1
              };
            }

            // Match legend: blend original color at 40% opacity with tooltip background
            // This simulates the legend's opacity: 0.4 effect
            const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';

            // Parse hex color to RGB
            const r = parseInt(originalColor.slice(1, 3), 16);
            const g = parseInt(originalColor.slice(3, 5), 16);
            const b = parseInt(originalColor.slice(5, 7), 16);

            // Parse background color to RGB
            const bgR = parseInt(tooltipBg.slice(1, 3), 16);
            const bgG = parseInt(tooltipBg.slice(3, 5), 16);
            const bgB = parseInt(tooltipBg.slice(5, 7), 16);

            // Blend at 40% opacity
            const blendedR = Math.round(r * 0.4 + bgR * 0.6);
            const blendedG = Math.round(g * 0.4 + bgG * 0.6);
            const blendedB = Math.round(b * 0.4 + bgB * 0.6);

            const blendedColor = `#${blendedR.toString(16).padStart(2, '0')}${blendedG.toString(16).padStart(2, '0')}${blendedB.toString(16).padStart(2, '0')}`;

            return {
              backgroundColor: blendedColor,
              borderColor: blendedColor,
              borderWidth: 1
            };
          },
          labelTextColor: function(context) {
            const datasetIndex = context.datasetIndex;
            const isVisible = visibleDatasets[datasetIndex];

            if (isVisible) {
              return textColor;
            }

            // Blend text color at 40% opacity with tooltip background
            const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
            const textColorHex = textColor;

            // Parse text color to RGB
            const r = parseInt(textColorHex.slice(1, 3), 16);
            const g = parseInt(textColorHex.slice(3, 5), 16);
            const b = parseInt(textColorHex.slice(5, 7), 16);

            // Parse background color to RGB
            const bgR = parseInt(tooltipBg.slice(1, 3), 16);
            const bgG = parseInt(tooltipBg.slice(3, 5), 16);
            const bgB = parseInt(tooltipBg.slice(5, 7), 16);

            // Blend at 40% opacity
            const blendedR = Math.round(r * 0.4 + bgR * 0.6);
            const blendedG = Math.round(g * 0.4 + bgG * 0.6);
            const blendedB = Math.round(b * 0.4 + bgB * 0.6);

            return `#${blendedR.toString(16).padStart(2, '0')}${blendedG.toString(16).padStart(2, '0')}${blendedB.toString(16).padStart(2, '0')}`;
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
          },
          callback: function(value, index, ticks) {
            const label = this.getLabelForValue(value);
            // Progressive label hiding based on screen size
            if (window.innerWidth <= 480) {
              return index % 3 === 0 ? label : '';
            } else if (window.innerWidth <= 768) {
              return index % 2 === 0 ? label : '';
            }
            return label;
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
  }), [isDarkMode, textColor, gridColor, allDatasets, visibleDatasets]);

  if (!chartData || chartData.datasets.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
      <style jsx>{`
        .chart-container {
          display: flex;
          gap: 16px;
          flex-direction: row;
        }
        .chart-wrapper {
          flex: 1;
          height: 400px;
          min-height: 400px;
          min-width: 0;
        }
        .legend-wrapper {
          display: flex;
          flex-direction: column;
          height: 360px;
          margin-top: 15px;
        }
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
          margin-bottom: 12px;
          cursor: pointer;
          font-size: 12px;
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
        }
        .legend-button {
          flex: 1;
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          background-color: ${isDarkMode ? '#241616' : '#FFFFFF'};
          color: ${isDarkMode ? '#F5F5DC' : '#374151'};
          border: 1px solid ${isDarkMode ? '#5a3a3a' : '#D0D0C0'};
        }
        .legend-button:hover {
          background-color: ${isDarkMode ? '#2d1d1d' : '#f9fafb'};
        }
        .legend-button:focus {
          outline: none;
        }

        @media (max-width: 768px) {
          .chart-container {
            flex-direction: column;
          }
          .chart-wrapper {
            height: 300px;
            min-height: 300px;
          }
          .legend-wrapper {
            flex-direction: column;
            height: auto;
            margin-top: -10px;
            gap: 18px;
            align-items: stretch;
          }
          .legend-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }
          .legend-controls > * {
            height: 28px;
          }
          .legend-nav {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .custom-legend {
            width: 100%;
            max-height: none;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, auto);
            gap: 8px;
            padding: 0;
            align-items: center;
          }
          .legend-nav-button {
            padding: 4px 12px;
            font-size: 12px;
            background-color: ${isDarkMode ? '#241616' : '#FFFFFF'};
            color: ${isDarkMode ? '#F5F5DC' : '#374151'};
            border: 1px solid ${isDarkMode ? '#5a3a3a' : '#D0D0C0'};
            border-radius: 4px;
            cursor: pointer;
            height: 28px;
            transition: all 0.2s;
          }
          .legend-nav-button:hover:not(:disabled) {
            background-color: ${isDarkMode ? '#2d1d1d' : '#f9fafb'};
          }
          .legend-nav-button:focus {
            outline: none;
          }
          .legend-nav-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          .legend-item {
            margin-bottom: 0;
          }
          .legend-color {
            width: 16px;
            height: 3px;
            margin-right: 6px;
          }
          .legend-label {
            white-space: nowrap;
          }
          .legend-buttons {
            width: auto;
            margin-top: 0;
            padding: 0;
            border-top: none;
          }
          .legend-button {
            flex: none;
            padding: 4px 12px;
            font-size: 12px;
            white-space: nowrap;
            height: 28px;
            width: 70px;
            background-color: ${isDarkMode ? '#241616' : '#FFFFFF'};
            color: ${isDarkMode ? '#F5F5DC' : '#374151'};
            border: 1px solid ${isDarkMode ? '#5a3a3a' : '#D0D0C0'};
            border-radius: 4px;
            transition: all 0.2s;
          }
          .legend-button:hover {
            background-color: ${isDarkMode ? '#2d1d1d' : '#f9fafb'};
          }
          .legend-button:focus {
            outline: none;
          }
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
        <div className="chart-container">
          <div className="chart-wrapper">
            <Line data={chartData} options={options} />
          </div>
          <div className="legend-wrapper">
            <div className="custom-legend" style={{ color: textColor, flex: '0 1 auto' }}>
              {(isMobile ? allDatasets.slice(legendPage * 9, (legendPage + 1) * 9) : allDatasets).map((dataset, idx) => {
                const index = isMobile ? legendPage * 9 + idx : idx;
                return (
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
                );
              })}
            </div>
            {isMobile ? (
              <div className="legend-controls">
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    className="legend-button"
                    onClick={toggleAll}
                  >
                    {toggleAllText}
                  </button>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <div className="legend-nav">
                    {allDatasets.length > 9 && (
                      <>
                        <button
                          className="legend-nav-button"
                          onClick={() => setLegendPage(Math.max(0, legendPage - 1))}
                          disabled={legendPage === 0}
                        >
                          ←
                        </button>
                        <span style={{ fontSize: '12px', color: textColor }}>
                          {legendPage + 1} / {Math.ceil(allDatasets.length / 9)}
                        </span>
                        <button
                          className="legend-nav-button"
                          onClick={() => setLegendPage(Math.min(Math.ceil(allDatasets.length / 9) - 1, legendPage + 1))}
                          disabled={legendPage >= Math.ceil(allDatasets.length / 9) - 1}
                        >
                          →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
                >
                  {toggleAllText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPATrendsChart;
