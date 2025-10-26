import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/theme';

const GPATrendsChart = ({ teachers, timePeriods }) => {
  const { isDarkMode } = useTheme();

  const colors = [
    '#be123c', '#b45309', '#a16207', '#16a34a', '#2563eb',
    '#7e22ce', '#0d9488', '#f97316', '#dc2626', '#22c55e'
  ];

  // Theme colors
  const gridColor = isDarkMode ? '#3f3f46' : '#d1d5db';
  const textColor = isDarkMode ? '#e7e5e4' : '#000000';

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!teachers || teachers.length === 0 || !timePeriods || timePeriods.length === 0) return [];

    // Reverse periods to show most recent on the left
    const periods = [...timePeriods].reverse();

    return periods.map(period => {
      const dataPoint = { period };

      teachers.forEach((teacher, index) => {
        if (!teacher.gpaHistory || typeof teacher.gpaHistory !== 'object') return;

        const termGpas = teacher.gpaHistory[period];
        if (!termGpas || termGpas.length === 0) {
          dataPoint[`teacher${index}`] = null;
        } else {
          const avgGpa = termGpas.reduce((a, b) => a + b, 0) / termGpas.length;
          dataPoint[`teacher${index}`] = avgGpa;
        }
      });

      return dataPoint;
    });
  }, [teachers, timePeriods]);

  // Generate teacher labels for legend
  const teacherLabels = useMemo(() => {
    if (!teachers || teachers.length === 0) return [];
    return teachers.map((teacher, index) => ({
      key: `teacher${index}`,
      name: (teacher.name || 'Unknown').split(' ').pop(),
      color: colors[index % colors.length]
    }));
  }, [teachers]);

  if (!teachers || teachers.length === 0 || !timePeriods || timePeriods.length === 0) {
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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="period"
              angle={-30}
              textAnchor="end"
              height={80}
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={textColor}
            />
            <YAxis
              domain={[0, 4]}
              ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]}
              tick={{ fill: textColor, fontSize: 12 }}
              stroke={textColor}
              label={{
                value: 'GPA',
                angle: -90,
                position: 'insideLeft',
                style: { fill: textColor, fontSize: 14 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '8px',
                color: textColor
              }}
              labelStyle={{ color: textColor, fontWeight: 'bold' }}
              formatter={(value) => value !== null ? value.toFixed(2) : 'N/A'}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value, entry) => {
                const teacherLabel = teacherLabels.find(t => t.key === entry.dataKey);
                return <span style={{ color: textColor }}>{teacherLabel?.name || value}</span>;
              }}
            />
            {teacherLabels.map((teacher) => (
              <Line
                key={teacher.key}
                type="linear"
                dataKey={teacher.key}
                stroke={teacher.color}
                strokeWidth={2}
                dot={{ fill: teacher.color, r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                name={teacher.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GPATrendsChart;
