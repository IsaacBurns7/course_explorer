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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 40, right: 200, bottom: 80, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;

    const xStep = chartWidth / (timePeriods.length - 1);
    const colors = [
      '#be123c', '#b45309', '#a16207', '#16a34a', '#2563eb',
      '#7e22ce', '#0d9488', '#f97316', '#dc2626', '#22c55e'
    ];

    // === Dark theme colors ===
    const gridColor = '#3f3f46';
    const axisColor = '#71717a';
    const textColor = '#e7e5e4';
    const titleColor = '#f5f5f4';

    // Draw grid and axes
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i < timePeriods.length; i++) {
      const x = margin.left + i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (0.0–4.0 GPA)
    for (let i = 0; i <= 8; i++) {
      const y = margin.top + (i / 8) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = textColor;
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

    // Y-axis labels (0–4)
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

    // --- Plot lines for each teacher ---
    teachers.forEach((teacher, index) => {
      if (!teacher.gpaHistory || typeof teacher.gpaHistory !== 'object') return;

      const gpaHistory = timePeriods.map(period => {
        const termGpas = teacher.gpaHistory[period];
        if (!termGpas || termGpas.length === 0) return null;
        return termGpas.reduce((a, b) => a + b, 0) / termGpas.length;
      });

      if (gpaHistory.every(v => v == null)) return;

      const color = colors[index % colors.length];
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      // Draw line
      ctx.beginPath();
      gpaHistory.forEach((gpa, i) => {
        if (gpa == null) return;
        const x = margin.left + i * xStep;
        const y = margin.top + chartHeight - (gpa / 4) * chartHeight;
        if (i === 0 || gpaHistory[i - 1] == null) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw data points
      gpaHistory.forEach((gpa, i) => {
        if (gpa == null) return;
        const x = margin.left + i * xStep;
        const y = margin.top + chartHeight - (gpa / 4) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Legend
      const legendX = margin.left + chartWidth + 20;
      const legendY = margin.top + index * 25;
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 6, 12, 12);
      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      const lastName = (teacher.name || 'Unknown').split(' ').pop();
      ctx.fillText(lastName, legendX + 20, legendY + 4);
    });

    // Chart title
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Historical GPA Trends by Teacher', canvas.width / 2, 25);
  };

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
        <canvas
          ref={canvasRef}
          width={1000}
          height={400}
          className="w-full h-auto max-w-full bg-dark-card"
        />
      </div>
    </div>
  );
};

export default GPATrendsChart;
