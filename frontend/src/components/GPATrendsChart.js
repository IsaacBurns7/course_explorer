import React, { useRef, useEffect } from 'react';

const GPATrendsChart = ({ teachers, timePeriods }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        renderChart();
    }, [teachers, timePeriods]);

    const renderChart = () => {
        const canvas = canvasRef.current;
        if (!canvas || !teachers || teachers.length === 0 || !timePeriods || timePeriods.length === 0) return;

        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chart dimensions
        const margin = { top: 40, right: 200, bottom: 80, left: 60 };
        const chartWidth = canvas.width - margin.left - margin.right;
        const chartHeight = canvas.height - margin.top - margin.bottom;

        const xStep = chartWidth / (timePeriods.length - 1);
        const colors = ['#5d0024', '#7c2d12', '#a16207', '#166534', '#1e40af', '#be185d', '#0f766e', '#7c3aed', '#dc2626', '#059669'];

        // Draw grid and axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i < timePeriods.length; i++) {
            const x = margin.left + i * xStep;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + chartHeight);
            ctx.stroke();
        }

        // Horizontal grid lines (0.0 to 4.0 GPA)
        for (let i = 0; i <= 8; i++) {
            const y = margin.top + (i / 8) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();

        // Draw time period labels
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        timePeriods.forEach((period, i) => {
            const x = margin.left + i * xStep;
            ctx.save();
            ctx.translate(x, canvas.height - 20);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(period, 0, 0);
            ctx.restore();
        });

        // Draw y-axis labels (GPA scale)
        ctx.textAlign = 'right';
        for (let i = 0; i <= 8; i++) {
            const y = margin.top + chartHeight - (i / 8) * chartHeight;
            const gpaValue = (i / 2).toFixed(1);
            ctx.fillText(gpaValue, margin.left - 10, y + 4);
        }

        // Y-axis title
        ctx.save();
        ctx.translate(20, margin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '14px sans-serif';
        ctx.fillText('GPA', 0, 0);
        ctx.restore();

        // Draw lines for each teacher
        teachers.forEach((teacher, index) => {
            if (!teacher.gpaHistory || teacher.gpaHistory.length === 0) return;
            
            const color = colors[index % colors.length];
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2;

            // Draw line
            ctx.beginPath();
            teacher.gpaHistory.forEach((gpa, i) => {
                if (gpa == null) return;
                const x = margin.left + i * xStep;
                const y = margin.top + chartHeight - (gpa / 4) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // Draw points
            teacher.gpaHistory.forEach((gpa, i) => {
                if (gpa == null) return;
                const x = margin.left + i * xStep;
                const y = margin.top + chartHeight - (gpa / 4) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });

            // Draw legend
            const legendX = margin.left + chartWidth + 20;
            const legendY = margin.top + index * 25;
            
            // Legend color box
            ctx.fillRect(legendX, legendY - 6, 12, 12);
            
            // Legend text
            ctx.fillStyle = '#374151';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            const lastName = (teacher.name || 'Unknown').split(' ').pop();
            ctx.fillText(lastName, legendX + 20, legendY + 4);
            ctx.fillStyle = color;
        });

        // Chart title
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Historical GPA Trends by Teacher', canvas.width / 2, 25);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">GPA Trends Over Time</h2>
                <p className="text-sm text-gray-600 mt-1">Historical GPA data for all teachers</p>
            </div>
            <div className="p-6">
                <canvas 
                    ref={canvasRef} 
                    width={1000} 
                    height={400}
                    className="w-full h-auto max-w-full"
                />
            </div>
        </div>
    );
};

export default GPATrendsChart;
