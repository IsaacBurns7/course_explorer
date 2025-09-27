require('dotenv').config()
const request = require('supertest');
const { expect } = require('chai');
const assert = require('chai').assert;
const app = require('../server'); 
const pool = require('../db');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Search API", () => {
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
    
    it("GET /search2/professors?courseNumber=&department= should return info of professors of a course", async () => {
        console.log("real test starts now.");
        const res = await request(app).get(`/api/search2/professors?courseNumber=120&department=CSCE`);
        try{
            // console.log(Object.keys(res.body).length);
            // console.log(res.body);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);

            for(const [professor_id, professor] of Object.entries(res.body)){
                // console.log(professor_id, professor);
                expect(professor).to.have.keys(["info", "courses", "ratings"]);

                expect(professor.info).to.include.keys([
                    "name", "averageGPA", "totalSections", 
                    "totalStudents", "averageRating", "totalRatings", 
                    "wouldTakeAgain"
                ]);

                expect(professor.courses).to.be.an("array");
                expect(professor.ratings).to.be.an("object");
            }
        }catch(error){
            console.log("Test failed. Response was: ", res.status, res.body);
            throw error;
        }
    });
    it('GET /search2/courses?courseNumber=&department= should return course info', async () => {
        const res = await request(app).get(`/api/search2/courses?courseNumber=120&department=CSCE`);
        try{
            // console.log(res.body);
            // console.log(Object.keys(res.body).length);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);
        }catch(error){
            console.log("Test failed. Response was: ", res.status, res.body);
            throw error;
        }
    });
    it('GET /search2/graphdata?courseNumber=&department= should return graph data', async () => {
        const res = await request(app).get(`/api/search2/graphData?courseNumber=120&department=CSCE`);
        try{
            // console.log(res.body);
            // console.log(Object.keys(res.body).length);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);
        }catch(error){
            console.log("Test failed. Response was: ", res.status, res.body);
            throw error;
        }
    });
    it('GET /search2/lineGraphData?courseNumber=&department= should return line graph data', async () => {
        const res = await request(app).get(`/api/search2/lineGraphData?courseNumber=120&department=CSCE`);
        try{
            // console.log(res.body);
            // console.log(Object.keys(res.body).length);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);
        }catch(error){
            console.log("Test failed. Response was: ", res.status, res.body);
            throw error;
        }
    });
});        