const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'planner2-stress-results.json');
const outputFile = path.join(__dirname, 'planner2-stress-results.html');

function readResults() {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Missing input file: ${inputFile}`);
  }

  const raw = fs.readFileSync(inputFile, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error('Expected planner2-stress-results.json to contain an array.');
  }

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return Number(value).toFixed(digits);
}

function chartSvg({ title, xValues, yValues, width = 700, height = 320, yLabel = '' }) {
  const margin = { top: 30, right: 20, bottom: 45, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const validPoints = xValues
    .map((x, i) => ({ x: Number(x), y: Number(yValues[i]) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  if (validPoints.length === 0) {
    return `
      <div class="chart-block">
        <h3>${escapeHtml(title)}</h3>
        <p>No valid data.</p>
      </div>
    `;
  }

  const xMin = Math.min(...validPoints.map((p) => p.x));
  const xMax = Math.max(...validPoints.map((p) => p.x));
  const yMinRaw = Math.min(...validPoints.map((p) => p.y));
  const yMaxRaw = Math.max(...validPoints.map((p) => p.y));

  const xMinFinal = xMin === xMax ? xMin - 1 : xMin;
  const xMaxFinal = xMin === xMax ? xMax + 1 : xMax;
  const yMinFinal = Math.min(0, yMinRaw);
  const yMaxFinal = yMinFinal === yMaxRaw ? yMaxRaw + 1 : yMaxRaw * 1.1;

  const xScale = (x) =>
    margin.left + ((x - xMinFinal) / (xMaxFinal - xMinFinal)) * plotWidth;
  const yScale = (y) =>
    margin.top + plotHeight - ((y - yMinFinal) / (yMaxFinal - yMinFinal)) * plotHeight;

  const polylinePoints = validPoints
    .map((p) => `${xScale(p.x)},${yScale(p.y)}`)
    .join(' ');

  const yTicks = 5;
  const xTicks = validPoints.length;

  const gridLines = [];
  for (let i = 0; i <= yTicks; i++) {
    const value = yMinFinal + ((yMaxFinal - yMinFinal) * i) / yTicks;
    const y = yScale(value);
    gridLines.push(`
      <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="grid" />
      <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" class="axis-label">
        ${formatNumber(value, 0)}
      </text>
    `);
  }

  const xLabels = validPoints
    .map((p) => {
      const x = xScale(p.x);
      return `
        <line x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 6}" class="axis" />
        <text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" class="axis-label">
          ${escapeHtml(p.x)}
        </text>
      `;
    })
    .join('');

  const dots = validPoints
    .map((p) => {
      const cx = xScale(p.x);
      const cy = yScale(p.y);
      return `
        <circle cx="${cx}" cy="${cy}" r="4" class="dot">
          <title>x=${p.x}, y=${formatNumber(p.y)}</title>
        </circle>
      `;
    })
    .join('');

  return `
    <div class="chart-block">
      <h3>${escapeHtml(title)}</h3>
      <svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="${escapeHtml(title)}">
        <text x="${width / 2}" y="20" text-anchor="middle" class="chart-title">${escapeHtml(title)}</text>

        ${gridLines.join('')}

        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis" />
        <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis" />

        <polyline points="${polylinePoints}" class="series-line" />
        ${dots}

        ${xLabels}

        <text x="${width / 2}" y="${height - 8}" text-anchor="middle" class="axis-title">Request rate (req/s)</text>
        <text x="18" y="${height / 2}" text-anchor="middle" transform="rotate(-90, 18, ${height / 2})" class="axis-title">
          ${escapeHtml(yLabel)}
        </text>
      </svg>
    </div>
  `;
}

function buildTable(results) {
  const rows = results
    .map((r) => {
      const errorRate =
        r.totalRequests ? ((r.errors / r.totalRequests) * 100).toFixed(2) : 'N/A';

      return `
        <tr>
          <td>${escapeHtml(r.rate)}</td>
          <td>${escapeHtml(r.totalRequests)}</td>
          <td>${escapeHtml(r.successes)}</td>
          <td>${escapeHtml(r.errors)}</td>
          <td>${errorRate}%</td>
          <td>${formatNumber(r.avgLatencyMs)}</td>
          <td>${formatNumber(r.p50LatencyMs)}</td>
          <td>${formatNumber(r.p95LatencyMs)}</td>
          <td>${formatNumber(r.p99LatencyMs)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table>
      <thead>
        <tr>
          <th>Rate</th>
          <th>Total</th>
          <th>Successes</th>
          <th>Errors</th>
          <th>Error %</th>
          <th>Avg ms</th>
          <th>P50 ms</th>
          <th>P95 ms</th>
          <th>P99 ms</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function buildHtml(results) {
  const rates = results.map((r) => r.rate);
  const avgLatencies = results.map((r) => r.avgLatencyMs);
  const p50Latencies = results.map((r) => r.p50LatencyMs);
  const p95Latencies = results.map((r) => r.p95LatencyMs);
  const p99Latencies = results.map((r) => r.p99LatencyMs);
  const errorRates = results.map((r) =>
    r.totalRequests ? (r.errors / r.totalRequests) * 100 : 0
  );
  const successes = results.map((r) => r.successes);
  const errors = results.map((r) => r.errors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Planner2 Stress Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 24px;
      line-height: 1.4;
      color: #222;
      background: #fff;
    }
    h1, h2, h3 {
      margin-bottom: 8px;
    }
    .meta {
      margin-bottom: 20px;
      color: #555;
    }
    .chart-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
      margin-top: 20px;
      margin-bottom: 32px;
    }
    .chart-block {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 14px;
      background: #fafafa;
    }
    .chart {
      width: 100%;
      height: auto;
      display: block;
      background: white;
      border-radius: 4px;
    }
    .grid {
      stroke: #e5e5e5;
      stroke-width: 1;
    }
    .axis {
      stroke: #333;
      stroke-width: 1.2;
    }
    .series-line {
      fill: none;
      stroke: #2563eb;
      stroke-width: 2.5;
    }
    .dot {
      fill: #dc2626;
    }
    .chart-title {
      font-size: 16px;
      font-weight: bold;
    }
    .axis-title {
      font-size: 13px;
      fill: #333;
    }
    .axis-label {
      font-size: 11px;
      fill: #555;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 14px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      text-align: right;
    }
    th:first-child, td:first-child {
      text-align: left;
    }
    thead {
      background: #f3f4f6;
    }
    code {
      background: #f3f4f6;
      padding: 2px 5px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Planner2 Stress Test Results</h1>
  <div class="meta">
    Source: <code>${escapeHtml(path.basename(inputFile))}</code>
  </div>

  <h2>Summary Table</h2>
  ${buildTable(results)}

  <h2>Charts</h2>
  <div class="chart-grid">
    ${chartSvg({
      title: 'Average latency vs request rate',
      xValues: rates,
      yValues: avgLatencies,
      yLabel: 'Latency (ms)',
    })}

    ${chartSvg({
      title: 'P50 latency vs request rate',
      xValues: rates,
      yValues: p50Latencies,
      yLabel: 'Latency (ms)',
    })}

    ${chartSvg({
      title: 'P95 latency vs request rate',
      xValues: rates,
      yValues: p95Latencies,
      yLabel: 'Latency (ms)',
    })}

    ${chartSvg({
      title: 'P99 latency vs request rate',
      xValues: rates,
      yValues: p99Latencies,
      yLabel: 'Latency (ms)',
    })}

    ${chartSvg({
      title: 'Error rate vs request rate',
      xValues: rates,
      yValues: errorRates,
      yLabel: 'Error rate (%)',
    })}

    ${chartSvg({
      title: 'Success count vs request rate',
      xValues: rates,
      yValues: successes,
      yLabel: 'Successful requests',
    })}

    ${chartSvg({
      title: 'Error count vs request rate',
      xValues: rates,
      yValues: errors,
      yLabel: 'Failed requests',
    })}
  </div>
</body>
</html>`;
}

function main() {
  const results = readResults();
  const html = buildHtml(results);
  fs.writeFileSync(outputFile, html, 'utf8');
  console.log(`Saved graph report to ${outputFile}`);
}

main();