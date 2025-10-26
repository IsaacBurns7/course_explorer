import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GPATrendsChart = ({ teachers, timePeriods }) => {
    const colors = [
        '#5d0024', '#7c2d12', '#a16207', '#166534', '#1e40af',
        '#be185d', '#0f766e', '#7c3aed', '#dc2626', '#059669'
    ];

    // Light theme colors
    const gridColor = '#e5e7eb';
    const textColor = '#374151';

    // Transform data for Recharts (no reverse for light theme)
    const chartData = useMemo(() => {
        if (!teachers || teachers.length === 0 || !timePeriods || timePeriods.length === 0) return [];

        return timePeriods.map(period => {
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">GPA Trends Over Time</h2>
            <p className="text-sm text-gray-600 mt-1">Historical GPA data for all teachers</p>
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
                    backgroundColor: '#ffffff',
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
