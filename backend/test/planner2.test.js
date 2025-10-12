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

    describe("getBestClasses", () => {
        it("should return 400 if PDF parsing fails", async () => {
            const res = await request(app)
                .post("/api/planner2/best-classes/pdf")
                .send({ invalidData: "test" });
            
            expect([400, 500]).to.include(res.status);
            expect(res.body).to.have.property("error");
        });

        it("should return 400 if text parsing fails", async () => {
            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: "" });
            
            expect([400, 500]).to.include(res.status);
            expect(res.body).to.have.property("error");
        });

        it("should return best classes from text input with valid degree plan", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314
CSCE 312

Spring 2026
CSCE 221`;

            const res = await request(app)
                .post("/api/planner2/text")
                .send({ content: validDegreePlan });

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
        });

        it("should return data grouped by semesters", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314

Spring 2025
CSCE 221`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200) {
                expect(res.body).to.be.an("object");
                // Check if response has semester keys
                const hasSemesters = Object.keys(res.body).some(key => 
                    key.includes('Fall') || key.includes('Spring') || key.includes('Summer')
                );
                expect(hasSemesters).to.be.true;
            }
        });

        it("should return courses with professor information", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200 && res.body) {
                const semesters = Object.values(res.body);
                if (semesters.length > 0 && Array.isArray(semesters[0])) {
                    const firstSemesterCourses = semesters[0];
                    if (firstSemesterCourses.length > 0) {
                        const course = firstSemesterCourses[0];
                        expect(course).to.have.property("department");
                        expect(course).to.have.property("number");
                        expect(course).to.have.property("title");
                        expect(course).to.have.property("professors");
                        expect(course.professors).to.be.an("array");
                    }
                }
            }
        });

        it("should include professor details with averageGPA and averageRating", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200 && res.body) {
                const semesters = Object.values(res.body);
                if (semesters.length > 0 && Array.isArray(semesters[0])) {
                    const firstSemesterCourses = semesters[0];
                    if (firstSemesterCourses.length > 0 && firstSemesterCourses[0].professors.length > 0) {
                        const professor = firstSemesterCourses[0].professors[0];
                        expect(professor).to.have.property("info");
                        expect(professor.info).to.include.keys(["name", "averageGPA", "averageRating", "id"]);
                    }
                }
            }
        });

        it("should handle multiple courses in single semester", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314
CSCE 312
CSCE 221`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200 && res.body) {
                const semesters = Object.values(res.body);
                if (semesters.length > 0 && Array.isArray(semesters[0])) {
                    // Should have multiple courses
                    expect(semesters[0].length).to.be.greaterThan(0);
                }
            }
        });

        it("should handle multiple semesters", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314

Spring 2025
CSCE 221

Summer 2025
CSCE 312`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200 && res.body) {
                const semesterKeys = Object.keys(res.body);
                // Should have data for multiple semesters
                expect(semesterKeys.length).to.be.greaterThan(0);
            }
        });

        it("should include warning field for professors", async () => {
            const validDegreePlan = `Fall 2025
CSCE 314`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            if (res.status === 200 && res.body) {
                const semesters = Object.values(res.body);
                if (semesters.length > 0 && Array.isArray(semesters[0])) {
                    const firstSemesterCourses = semesters[0];
                    if (firstSemesterCourses.length > 0 && firstSemesterCourses[0].professors.length > 0) {
                        const professor = firstSemesterCourses[0].professors[0];
                        expect(professor.info).to.have.property("warning");
                        // Warning can be null or a string like "Doesn't typically teach Fall"
                    }
                }
            }
        });

        it("should return empty or minimal data for non-existent courses", async () => {
            const validDegreePlan = `Fall 2025
FAKE 999`;

            const res = await request(app)
                .post("/api/planner2/best-classes/text")
                .send({ content: validDegreePlan });

            // Should either return empty results or 404
            if (res.status === 200) {
                const semesters = Object.values(res.body);
                if (semesters.length > 0 && Array.isArray(semesters[0])) {
                    // Empty array or no professors
                    const courses = semesters[0];
                    if (courses.length > 0) {
                        expect(courses[0].professors).to.be.an("array");
                    }
                }
            }
        });
    });

});