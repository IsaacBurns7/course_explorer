// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

const fs = require('fs');

const term = "202531";
const crn = "57836";


const fetchData = async (term, crn) => {

    const detailsUrl = `https://howdy.tamu.edu/api/course-section-details?term=${term}&subject=&course=&crn=${crn}`;
    const jsonsUrl = `https://howdy.tamu.edu/api/section-meeting-times-with-profs/`;
    const attributesUrl = `https://howdy.tamu.edu/api/section-attributes/`;
    const scheduleUrl = `https://howdyportal.tamu.edu/api/course-sections`;
    const detailsResponse = await fetch(detailsUrl);

    const scheduleResponse = await fetch(scheduleUrl, {
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
    const schedule = await scheduleResponse.json();
    const details = await detailsResponse.json();

    const jsonsResponse = await fetch(jsonsUrl, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ term, crn }),
    });
    const jsons = await jsonsResponse.json();

    const attributesResponse = await fetch(attributesUrl, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ term, crn }),
    });
    const attributes = await attributesResponse.json();

    const detailsData = JSON.stringify(details, null, 2);
    const jsonsData = JSON.stringify(jsons, null, 2);
    const attributesData = JSON.stringify(attributes, null, 2);
    const scheduleData = JSON.stringify(schedule, null, 2);

    fs.writeFileSync('./details.json', detailsData, 'utf8');
    fs.writeFileSync('./jsons.json', jsonsData, 'utf8');
    fs.writeFileSync('./attributes.json', attributesData, 'utf8');
    fs.writeFileSync('./schedule.json', scheduleData, 'utf8');
};

fetchData(term, crn);