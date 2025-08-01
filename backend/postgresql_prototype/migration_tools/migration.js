require('dotenv').config({path: "../../.env"});
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Department = require("../../models/department.js");

const fs = require('fs');
const path = require('path');

async function clearTables(pool, filePath){
    try{
        const sql = fs.readFileSync(filePath, "utf-8");
        await pool.query(sql);
        console.log(`Successfully executed ${filePath}`);
    }catch(error){
        console.error(`Error executing ${filePath}: `, error);
    }
}

async function migrateUserSchema(){
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

    const filePath = path.join(__dirname, "../models/department.sql")
    await clearTables(pgPool, filePath);

    const departments = await Department.find({});

    pgPool.query('SELECT NOW()', (err, res) => {
        if(err){
            console.error("Connection error", err.stack);
        } else {
            console.log("Connected to postgresql at: ", res.rows[0].now);
        }
    });
 
    for(const department of departments){
        const courses = department.courses;
        const id = department._id;
        const name = department.info.name;
        await pgPool.query(`INSERT INTO CourseExplorer.departments (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, 
            [id, name],
            // (err, res) => {
                // if(err){
                //     console.error("error", err.stack);
                // }
                // else{
                //     console.log("Response: ", res);
                // }
            // }
        );

        for(const course of courses){
            await pgPool.query(`INSERT INTO CourseExplorer.department_courses (department_id, course_number, title, description)
                VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [
                    id, course.courseNumber, course.courseTitle, course.courseDescription
                ],
                // (err, res) => {
                //     if(err){
                //         console.error("error", err.stack);
                //     }
                //     else{
                //         console.log("Response: ", res);
                //     }
                // }
            );
        }
    }

    await mongoose.disconnect();
    await pgPool.end();
}

migrateUserSchema().catch(console.error);