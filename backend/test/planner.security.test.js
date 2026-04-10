const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const pool = require('../db');

async function checkHealth() {
  const client = await pool.connect();

  try {
    const healthServer = await request(app).get('/api/health/level1');
    expect(healthServer.status).to.equal(200);
    expect(healthServer.body).to.have.property('STATUS');

    const healthDB = await client.query('SELECT 1');
    expect(healthDB.rows).to.be.an('array');
  } finally {
    client.release();
  }
}

describe('Planner API security / malicious input handling', () => {
  before(async () => {
    await checkHealth();
  });

  

  describe('POST /api/planner2/optimalSchedule', () => {

    it('accepts valid input and returns a well-typed response', async () => {
      const payload = {
        courses: ['CSCE_314', 'MATH_304'],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.not.have.property('error');

      // Keep this flexible until the response contract is finalized.
      // Common successful shapes:
      //   { schedules: [...] }
      //   { schedule: [...] }
      //   { result: ... }
      expect(
        res.body.hasOwnProperty('schedules') ||
        res.body.hasOwnProperty('schedule') ||
        res.body.hasOwnProperty('result') ||
        Object.keys(res.body).length > 0
      ).to.equal(true);

      if (Array.isArray(res.body.schedules)) {
        res.body.schedules.forEach((schedule) => {
          expect(schedule).to.be.an('object');
        });
      }

      if (Array.isArray(res.body.schedule)) {
        res.body.schedule.forEach((item) => {
          expect(item).to.be.an('object');
        });
      }
    });

    it('rejects SQL injection-like course input safely', async () => {
      const payload = {
        courses: ["CSCE_314'; DROP TABLE professors; --"],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);

      // Tighten this once you know the exact contract.
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error');
    });

    it('rejects SQL injection-like semester input safely', async () => {
      const payload = {
        courses: ['CSCE_314'],
        semester: "Spring 2026'; DROP TABLE courses; --"
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error');
    });

    it('rejects non-array courses safely', async () => {
      const payload = {
        courses: 'CSCE_314',
        semester: 'Spring 2026'
      };
    
      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.have.property('error');
    });

    it('rejects null input values safely', async () => {
      const payload = {
        courses: null,
        semester: null
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.have.property('error');
    });

    it('rejects object elements inside courses safely', async () => {
      const payload = {
        courses: [{ code: 'CSCE_314' }],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.have.property('error');
    });

    it('rejects malformed special-character input safely', async () => {
      const payload = {
        courses: ['<script>alert(1)</script>', '../../etc/passwd', 'CSCE_314\nMATH_304'],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 422]);
      expect(res.body).to.have.property('error');
    });

    it('rejects excessively long course strings safely', async () => {
      const payload = {
        courses: ['A'.repeat(10000)],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 413, 422]);
    });

    it('rejects excessively large course lists safely', async () => {
      const hugeCourseList = Array.from({ length: 5000 }, (_, i) => `FAKE_${i}`);

      const payload = {
        courses: hugeCourseList,
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      expect(res.status).to.not.equal(500);
      expect(res.status).to.be.oneOf([400, 413, 422]);
    });

    it('handles duplicate course requests safely', async () => {
      const payload = {
        courses: ['CSCE_314', 'CSCE_314', 'CSCE_314'],
        semester: 'Spring 2026'
      };

      const res = await request(app)
        .post('/api/planner2/optimalSchedule')
        .send(payload);

      // Adjust this once you define the desired behavior:
      // reject duplicates, or accept and deduplicate.
      expect(res.status).to.not.equal(500);
    });
  });
});