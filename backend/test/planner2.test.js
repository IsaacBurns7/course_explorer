const dotenv = require('dotenv');
dotenv.config({ path: "../.env"});
const request = require('supertest');
const { expect } = require('chai');
const assert = require('chai').assert;
const app = require('../server'); 
const pool = require('../db');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Planner API", () => {
    console.log("Starting test suite execution...");
    // it("Search professors should return 400 if missing query parameter", async () => {
    //     const res = await request(app).get("/api/search2/professors");
    //     expect(res.status).to.equal(400);
    //     expect(res.body).to.have.property("error");
    // });
    // it("Search courses should return 400 if missing query parameter", async () => {
    //     const res = await request(app).get("/api/search2/courses");
    //     expect(res.status).to.equal(400);
    //     expect(res.body).to.have.property("error");
    // });
    // it("Search graphData should return 400 if missing query parameter", async () => {
    //     const res = await request(app).get("/api/search2/graphData");
    //     expect(res.status).to.equal(400);
    //     expect(res.body).to.have.property("error");
    // });
    // it("Search lineGraphData should return 400 if missing query parameter", async () => {
    //     const res = await request(app).get("/api/search2/lineGraphData");
    //     expect(res.status).to.equal(400);
    //     expect(res.body).to.have.property("error");
    // });
    async function checkHealth(){
        const client = await pool.connect();
        const healthServer = await request(app).get(`/api/health/level1`);
        const healthDB = await client.query("SELECT 1");
        console.log("Before test: ", healthServer.body, healthDB.rows);
        console.log("Server OK, DB OK");
        client.release();
    }

    checkHealth();

    it("GET /planner2/class should return info of a class", async () => {
        console.log("real test starts now.");
        let res = null;
        try{
            //everything eles is working perfectly. why the fuck is res undefined
            res = await request(app)
                .post("/api/planner2/class")
                .send({class: "CSCE 120"});
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);
            expect(res.body).to.include.keys(["department", "number", "title", "hours", "professors"]);
            expect(res.body.professors).to.be.an("array");
        } catch (error){
            console.log("Test failed. Response was: ", res.status, res.body);
            console.log("Creating error: ", error);
            throw error;
        }
    });

});