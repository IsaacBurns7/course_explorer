const request = require('supertest');
const { expect } = require('chai');
const assert = require('chai').assert;
const app = require('../server'); 

describe("Search API", () => {
    it("Search professors should return 400 if missing query parameter", async () => {
        const res = await request(app).get("/api/search/professors");
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });
    it("Search courses should return 400 if missing query parameter", async () => {
        const res = await request(app).get("/api/search/courses");
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });
    it("Search graphData should return 400 if missing query parameter", async () => {
        const res = await request(app).get("/api/search/graphData");
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });
    it("Search lineGraphData should return 400 if missing query parameter", async () => {
        const res = await request(app).get("/api/search/lineGraphData");
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });

    // it('GET /searchProfessors?query=<name> should return professor Info', async () => {
    //     const res = await request(app).get(`/api/search/searchProfessors?query=John`);
    //     try{
    //         // console.log(Object.keys(res.body).length);
    //         expect(res.status).to.equal(200);
    //         expect(res.body).to.be.an("array");
    //         expect(res.body.length).to.be.greaterThan(0);
    //     }catch(error){
    //         console.log("Test failed. Response was: ", res.status, res.body);
    //         throw error;
    //     }
    // });
});        