const dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const pool = require('../db');

describe('Professor API (integration)', () => {
	before(async () => {
		// Mirror the health/db sanity check style used in search2.test.js,
		// but await it so failures surface deterministically.
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
	});

	it('GET /api/professors/getAll returns array of professor names', async () => {
		const res = await request(app).get('/api/professors/getAll');
		try {
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');

			// Be resilient to empty DBs, but validate shape when populated.
			if (res.body.length > 0) {
				expect(res.body[0]).to.be.a('string');
			}
		} catch (error) {
			console.log('Test failed. Response was: ', res.status, res.body);
			throw error;
		}
	});
});