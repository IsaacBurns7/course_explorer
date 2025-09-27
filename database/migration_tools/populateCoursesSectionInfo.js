const { Pool } = require('pg');
const { bulkInsert } = require("./utils");
const course = require('../../backend/models/course');

async function populateCoursesSectionInfo(){
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });

    const client = await pgPool.connect();

    const courseSectionsUrl = `https://howdyportal.tamu.edu/api/course-sections`;

    const courseSectionsResponse = await fetch(courseSectionsUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
        },
        body: JSON.stringify({
            startRow: 0,
            endRow: 0,
            publicSearch: "Y",
            termCode: "202531"
        })
    });
    const courseSectionEntriesRaw = await courseSectionsResponse.json();
    // const courseSectionEntries = courseSectionEntriesRaw.map((sectionObj) => {
    //     const newObj = Object.entries(sectionObj).map(([key, value]) => [
    //             key.replace("/^SWV_/", ""),
    //             value
    //         ])
    //     return newObj;
    // })

    // console.log(courseSectionEntries);

    bulkInsert(client, "course_explorer.courses_section_info", courseSectionEntriesRaw, 1000);
    console.log("Course Section Info Population Complete");

    await pgPool.end();
}


populateCoursesSectionInfo().catch(console.error).finally(() => {
    process.exit(0);
});