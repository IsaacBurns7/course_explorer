require('dotenv').config({path: "../../.env"});
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Course = require("../../models/course");

const fs = require('fs');
const path = require('path');

async function resetTables(client, filePath){
    try{
        const sql = fs.readFileSync(filePath, "utf-8");
        await client.query(sql);
        console.log(`Successfully executed ${filePath}`);
    }catch(error){
        console.error(`Error executing ${filePath}: `, error);
    }
}

function buildInsert(table, obj) {
  const keys = Object.keys(obj);
  const cols = keys.join(", ");
  const placeholders = keys.map((_, i) => `$${i+1}`).join(", ");
  const values = Object.values(obj);

  return [
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
    values
  ];
}

//the driver breaks down at a certain parameter size - 65536 is a hard limit
function buildBulkInsert(table, arrayOfObj){
    // console.log(arrayOfObj, Array.isArray(arrayOfObj), typeof(arrayOfObj), arrayOfObj.length); //51911 length
    if(typeof arrayOfObj !== "object" || !Array.isArray(arrayOfObj) || arrayOfObj === null){
        console.log("buildBulkInsert failed, arrayofObj was of unexpected type");
        return;
    }
    if(arrayOfObj.length === 0){
        console.log("buildBulkInsert failed, array was of length 0");
        return;
    } 
    const keys = Object.keys(arrayOfObj[0]);
    // console.log(keys, keys.length);
    if(keys.length === 0){
        console.log("buildBulkInsert failed, keys were of length 0");
    }
    const cols = keys.join(", ");
    const placeholders = arrayOfObj.map((_, i) => {
        const base = i * keys.length;
        return `(${keys.map((_, j) => `$${base + j + 1}`).join(", ")})`;
    }).join(", ");
    const values = arrayOfObj.flatMap((obj, _) => {
        // console.log(Object.values(obj).length);
        return Object.values(obj);
    });
    // console.log(placeholders); //986309 length
    // console.log(values, values.length); //986309 length

    //note: the below "ON CONFLICT DO NOTHING", requires the table have a PRIMARY KEY set, so the engine can find the correct constraint to avoid duplicate inserts
    return [
        `INSERT INTO ${table} (${cols}) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        values
    ];
}

//inserts in chunks of batchSize, batchSize CAN NOT BE more than 65536. See 986309 % 65536 = 3269, 
//error message -> error: bind message has 3269 parameter formats but 0 parameters
//parameters
function bulkInsert(client, table, arrayOfObj, batchSize){
     // console.log(arrayOfObj, Array.isArray(arrayOfObj), typeof(arrayOfObj), arrayOfObj.length); //51911 length
    if(typeof arrayOfObj !== "object" || !Array.isArray(arrayOfObj) || arrayOfObj === null){
        console.log("bulkInsert failed, arrayofObj was of unexpected type");
        return;
    }
    if(arrayOfObj.length === 0){
        console.log("bulkInsert failed, array was of length 0");
        return;
    } 
    const keys = Object.keys(arrayOfObj[0]);
    // console.log(keys, keys.length);
    if(keys.length === 0){
        console.log("bulkInsert failed, keys were of length 0");
        return;
    }
    const cols = keys.join(", ");
    const maxBatchSize = 65536 / keys.length;
    if(batchSize > maxBatchSize){
        console.log("bulkInsert may FAIL, batch size exceeds limit");
    }
    // console.log(placeholders); //986309 length
    // console.log(values, values.length); //986309 length

    //note: the below "ON CONFLICT DO NOTHING", requires the table have a PRIMARY KEY set, so the engine can find the correct constraint to avoid duplicate inserts
    //note: values.length, and final $ on placeholder sohuld be the same(for alignment)
    //additionally, arrayOfObj * Object.keys(arrayOfObj[<any>]).length MUST EQUAL values.length (again for alignment)
    
    //SPECIAL NOTE: batch size must be < 65536 / keys.length
    for(let i = 0; i < arrayOfObj.length; i+= batchSize){
        const batch = arrayOfObj.slice(i,i + batchSize);
        const placeholders = batch.map((_, i) => {
        const base = i * keys.length;
            return `(${keys.map((_, j) => `$${base + j + 1}`).join(", ")})`;
        }).join(", ");
        const values = batch.flatMap((obj, _) => {
            return Object.values(obj);
        });
        const sql = `INSERT INTO ${table} (${cols}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
        const params = values;
        client.query(sql, params);
    }    
}

async function migrateCourseSchema(){
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

    const client = await pgPool.connect();

    const filePath = path.join(__dirname, "../models/course.sql")
    // await resetTables(client, filePath);

    const courses = await Course.find({});

    await client.query('SELECT NOW()', (err, res) => {
        if(err){
            console.error("Connection error", err.stack);
        } else {
            console.log("Connected to postgresql at: ", res.rows[0].now);
        }
    });

    const values = courses.map((course, index) => {
        const base = index * 10;
        return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10})`;
    }).join(", ");

    const params = courses.flatMap(course => {
        const info = course.info;
        const { department, number, title, description, averageGPA, totalSections, totalStudents, averageRating, totalRatings } = info;
        return [
            course._id,
            department,
            number,
            title,
            description,
            averageGPA,
            totalSections,
            totalStudents,
            averageRating,
            totalRatings
        ];
    });
    // console.log(values, params);

    await client.query(`INSERT INTO course_explorer.courses (id, department, number, title, description, averageGPA, totalSections, totalStudents, averageRating, totalRatings)
        VALUES ${values}
        ON CONFLICT DO NOTHING`,
        params);
    
    const professorEntries = courses.flatMap((course) => {
        const addedEntries = course.professors.flatMap((professor_id) => {
            return {
                course_id: course._id,
                professor_id
            }
        })
        return addedEntries;
    });
    const [professorSql, professorParams] = buildBulkInsert("course_explorer.courses_professors", professorEntries);
    // console.log(professorEntries);
    // console.log(professorSql, professorParams);
    await client.query(professorSql, professorParams);

    const sectionEntries = courses.flatMap((course) => {
        // console.log(course.sections, typeof course.sections, course.sections instanceof Map);
        // console.log(Object.values(course.sections), typeof Object.values(course.sections));
        const addedEntries = [...course.sections].flatMap(([semester_id, semester]) => {
            // console.log(semester, typeof semester);
            const semesterSections = semester.flatMap((sectionObj) => {
                const sectionDefaults = {
                    section_id: null,
                    A: null,
                    B: null,
                    C: null,
                    D: null,
                    F: null,
                    I: null,
                    S: null,
                    U: null,
                    Q: null,
                    X: null,
                    prof: null,
                    year: null,
                    semester: null,
                    gpa: null,
                    crn: null, 
                    hours: null,
                    site: null,
                    professor_id: null
                }
                const plain = sectionObj.toObject();
                // console.log(plain);
                const { section, prof_id, _id, times, ...rest } = plain; //_id is unneeded as it will be replaced, times will be in a separate table

                const newSectionObj = {
                    ...sectionDefaults,
                    ...rest,
                    course_id: course._id,
                    section_id: section,
                    professor_id: prof_id,
                    semester_id: semester_id
                }
                return newSectionObj;
            });
            return semesterSections;
        });
        return addedEntries;
    });
    // console.log(sectionEntries);
    // const [sectionSql, sectionParams] = buildBulkInsert("course_explorer.courses_sections", sectionEntries);
    // console.log(sectionSql, sectionParams);
    bulkInsert(client, "course_explorer.courses_sections", sectionEntries, 1000);

    const sectionTimesEntries = courses.flatMap((course) => {
        // console.log(course.sections, typeof course.sections, course.sections instanceof Map);
        // console.log(Object.values(course.sections), typeof Object.values(course.sections));
        const addedEntries = [...course.sections].flatMap(([semester_id, semester]) => {
            // console.log(semester, typeof semester);
            const semesterSections = semester.flatMap((sectionObj) => {
                const section_id = sectionObj.section;
                const times = sectionObj.times ?? {};
                const sectionTimes = Object.entries(times).flatMap(([day, timeArray]) => {
                    const timesDefault = {
                        course_id: null,
                        semester_id: null,
                        section_id: null,
                        day: null,
                        start_time: null,
                        end_time:null
                    };

                    return {
                        ...timesDefault,
                        course_id: course._id,
                        semester_id,
                        section_id,
                        day,
                        start_time: timeArray?.[0] ?? null, 
                        end_time: timeArray?.[1] ?? null
                    }
                });
                return sectionTimes;
            });
            return semesterSections;
        });
        return addedEntries;
    });
    // console.log(sectionTimesEntries);

    bulkInsert(client, "course_explorer.courses_section_times", sectionTimesEntries, 1000);
    console.log("Course Migration Complete");

    await mongoose.disconnect();
    await pgPool.end();
}


migrateCourseSchema().catch(console.error).finally(() => {
    process.exit(0);
});