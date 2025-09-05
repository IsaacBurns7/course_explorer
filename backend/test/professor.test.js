const request = require('supertest');
const { expect } = require('chai');
const assert = require('chai').assert;
const app = require('../server'); 

describe("Professor API", () => {
    it("should return 400 if missing professorID", async () => {
        const res = await request(app).get("/api/professorTEST/professorInfo");
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("error");
    });

    it('GET /professorInfo?<params> should return professor Info', async () => {
        const res = await request(app).get(`/api/professorTEST/professorInfo?professorID=100615`);
        try{
            // console.log(Object.keys(res.body).length);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(Object.keys(res.body).length).to.be.greaterThan(0);
        }catch(error){
            console.log("Test failed. Response was: ", res.status, res.body);
            throw error;
        }
    });
    //this is literally just not used
    // it('GET /professorByName/:name should return professor by name', async () => {
    //     const res = await request(app).get(`/api/professorTEST/professorByName/'John M. Moore'`);
    //     try{
    //         // console.log(Object.keys(res.body).length);
    //         expect(res.status).to.equal(200);
    //         expect(res.body).to.be.an("object");
    //         expect(Object.keys(res.body).length).to.be.greaterThan(0);
    //     }catch(error){
    //         console.log("Test failed. Response was: ", res.status, res.body);
    //         throw error;
    //     }
    // });
}); 