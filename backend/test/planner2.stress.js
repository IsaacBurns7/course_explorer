const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const request = require('supertest');
const fs = require('fs');
const path = require('path');

const app = require('../server');

const rates = [1, 5, 10, 25, 50];
const testDurationMs = 15000;

const payload = {
  courses: ['CSCE_314', 'MATH_304'],
  semester: 'Spring 2026',
};

const outputFile = path.join(__dirname, 'planner2-stress-results.json');

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function fireRequest(latencies) {
  const t0 = Date.now();

  try {
    const res = await request(app)
      .post('/api/planner2/optimalSchedule')
      .send(payload);

    const latency = Date.now() - t0;
    latencies.push(latency);

    const body = res.body;
    const isGoodType =
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      !body.error;

    return {
      ok: res.status === 200 && isGoodType,
      status: res.status,
      body,
      latency,
    };
  } catch (err) {
    const latency = Date.now() - t0;
    latencies.push(latency);

    return {
      ok: false,
      error: err.message,
      latency,
    };
  }
}

async function runRate(rate) {
  const latencies = [];
  let errors = 0;
  let successes = 0;
  let started = 0;

  const sampleErrors = [];
  const intervalMs = 1000 / rate;
  const startTime = Date.now();
  const pending = [];

  while (Date.now() - startTime < testDurationMs) {
    started++;

    pending.push(
      fireRequest(latencies).then((result) => {
        if (result.ok) {
          successes++;
        } else {
          errors++;
          if (sampleErrors.length < 10) {
            sampleErrors.push({
              status: result.status ?? null,
              error: result.error ?? null,
              body: result.body ?? null,
            });
          }
        }
      })
    );

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  await Promise.allSettled(pending);

  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length
      : null;

  return {
    rate,
    totalRequests: started,
    successes,
    errors,
    avgLatencyMs: avgLatency,
    p50LatencyMs: percentile(latencies, 50),
    p95LatencyMs: percentile(latencies, 95),
    p99LatencyMs: percentile(latencies, 99),
    sampleErrors,
  };
}

(async () => {
  const results = [];

  for (const rate of rates) {
    console.log(`Running ${rate} req/s for ${testDurationMs / 1000} s...`);
    const result = await runRate(rate);
    results.push(result);
    console.log(JSON.stringify(result, null, 2));
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Saved results to ${outputFile}`);
})();