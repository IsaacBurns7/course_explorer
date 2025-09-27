require('dotenv').config({path: "../../.env"});
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Professor = require("../../models/professor");
const { bulkInsert } = require("./utils");

const fs = require('fs');
const path = require('path');
const professor = require('../../models/professor');

async function migrateProfessorSchema(){
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

    const client = await pgPool.connect();
    
    const professors = await Professor.find({});

    //no safeguards against nullism b/c assumption that all attributes are required
    const professorEntries = professors.flatMap((professor) => {
        const info = professor.info;
        const { 
            name, 
            averageGPA,
            totalSections,
            totalStudents,
            averageRating,
            totalRatings,
            wouldTakeAgain,
            difficulty,
            rmpLink
         } = info;
        return { 
            id: professor._id,
            name,
            averageGPA,
            totalSections,
            totalStudents,
            averageRating,
            totalRatings,
            wouldTakeAgain,
            difficulty,
            rmpLink
        };
    });

    const professorTagEntries = professors.flatMap((professor) => {
        const plainProfessor = professor.toObject();
        const ratings = plainProfessor.ratings ?? []; //is a map
        // console.log(ratings);
        return [...ratings].flatMap(([course_id, courseRatingObj]) => {
            // console.log(course_id, courseRatingObj);
            const tags = courseRatingObj.tags ?? {};
            return Object.entries(tags).flatMap(([tag, frequency]) => {
                return {
                    professor_id: professor._id,
                    course_id,
                    tag,
                    frequency
                }
            })
        })
    });

    const professorCourseEntries = professors.flatMap((professor) => {
        const courses = professor.courses ?? [];
        return courses.flatMap((course) => {
            return {
                professor_id: professor._id,
                course_id: course
            }
        })
    });

    const professorRatingEntries = professors.flatMap((professor) => {
        const ratings = professor.ratings ?? [];
        return [...ratings].flatMap(([course_id, ratingObj]) => {
            return Object.entries(ratingObj.ratings ?? {}).flatMap(([value, freq]) => {
                return {
                    professor_id: professor._id,
                    course_id,
                    value,
                    frequency: freq
                };
            });
        })
    });
    

    try {
        console.log("Beginning transaction...")
        await client.query("BEGIN");
        bulkInsert(client, "course_explorer.professors", professorEntries, 1000);
        bulkInsert(client, "course_explorer.professor_tags", professorTagEntries, 1000);
        bulkInsert(client, "course_explorer.professor_courses", professorCourseEntries, 1000);
        bulkInsert(client, "course_explorer.professor_ratings", professorRatingEntries, 1000);
        await client.query("COMMIT");
        console.log("TRANSACTION Committed...");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log("ROLLBACK!");
        throw error;
    } finally {
        client.release();
        await pgPool.end();
        await mongoose.disconnect();   
        console.log("disconnected"); 
    }
}

migrateProfessorSchema().catch(console.error);