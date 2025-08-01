require('dotenv').config({path: "../../.env"});
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Department = require("../../models/department.js");

async function migrateUserSchema(){
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

    const departments = await Department.find({});

    pgPool.query('SELECT NOW()', (err, res) => {
        if(err){
            console.error("Connection error", err.stack);
        } else {
            console.log("Connected to postgresql at: ", res.rows[0].now);
        }
    });
 
    for(const department of departments){
        console.log(department);
    }


    await mongoose.disconnect();
    await pgPool.end();
}

migrateUserSchema().catch(console.error);