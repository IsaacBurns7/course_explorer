"use strict";
const rl = require('readline-sync');
const fs = require('fs');
const populateClasses = require('./populateClasses');
const adjustData = require('./adjustClasses');
// ---------------------------
// Semester prompt
// ---------------------------
const sem = rl.question("What semester would you like to parse? Format it in YYYYS format, where YYYY is year (2025) and S is semester (1 = Spring, 2 = Summer, 3 = Fall): ");
const semRegex = /^\d{4}[123]$/;
if (!sem.match(semRegex)) {
    console.log("Invalid Semester");
    process.exit(0);
}
// ---------------------------
// Helper to change semester key formats
// ---------------------------
function changeSem(data) {
    for (const key of Object.keys(data)) {
        for (const keySem of Object.keys(data[key].sections)) {
            let year = keySem.substring(0, 4);
            let semMap = { "1": "Spring", "2": "Summer", "3": "Fall" };
            let semname = semMap[keySem.substring(4, 5)];
            if (semname == undefined)
                continue;
            if (keySem == `${semname} ${year}`)
                continue;
            data[key].sections[`${semname} ${year}`] = data[key].sections[keySem];
            delete data[key].sections[keySem];
        }
    }
    return data;
}
// ---------------------------
// Merge helper
// ---------------------------
function mergeData(existingData, newData) {
    for (const [courseKey, courseVal] of Object.entries(newData)) {
        if (!existingData[courseKey]) {
            existingData[courseKey] = courseVal;
        }
        else {
            // Merge sections
            existingData[courseKey].info.attributes = newData[courseKey].info.attributes;
            for (const [sectionKey, sectionVal] of Object.entries(courseVal.sections || {})) {
                existingData[courseKey].sections[sectionKey] = sectionVal;
                sectionVal.forEach(x => {
                    existingData[courseKey].info.totalStudents += ((x.A || 0) + (x.B || 0) + (x.C || 0) + (x.D || 0) + (x.F || 0) + (x.I || 0) + (x.S || 0) + (x.U || 0) + (x.Q || 0) + (x.X || 0));
                    console.log(x.prof_id);
                    if (x.prof_id && !existingData[courseKey].professors.includes(x.prof_id)) {
                        existingData[courseKey].professors.push(x.prof_id);
                        console.log("Added " + x.prof_id);
                    }
                });
            }
        }
    }
    return existingData;
}
// ---------------------------
// Add attributes to sections
// ---------------------------
const seasonOrder = { "Spring": "1", "Summer": "2", "Fall": "3" };
const siteCodes = { "College Station": "1", "Galveston": "2", "Qatar": "3" };
// create a map to store semester codes with their api response
const responses = {};
async function getAttributesForSemester(year, semester, site = "College Station") {
    const termCode = `${year}${seasonOrder[semester]}${siteCodes[site]}`;
    let data = responses[termCode];
    if (!data) {
        const response = await fetch("https://howdyportal.tamu.edu/api/course-sections", {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                startRow: 0,
                endRow: 0,
                termCode: termCode,
                publicSearch: "Y"
            }),
            method: "POST"
        });
        if (!response.ok) {
            console.error(`Failed to fetch for ${semester} ${year}`);
            return [];
        }
        data = await response.json();
        responses[termCode] = data;
    }
    // the API usually returns sections, grab attributes from them
    const sections = data.response?.data ?? [];
    return sections.map(s => s.SWV_CLASS_SEARCH_ATTRIBUTES).filter(Boolean);
}
async function patchCourseAttributes(course) {
    if (!course || !course.sections) {
        console.log(course);
        return course;
    }
    const semesters = Object.keys(course.sections);
    for (const sem of semesters) {
        for (const section of course.sections[sem]) {
            if (!section.attributes || section.attributes.length === 0) {
                console.log(`Patching attributes for ${course.info.department} ${course.info.number}, ${sem} section ${section.section}`);
                const { year, semester, site } = section;
                const attrs = await getAttributesForSemester(year, semester, site);
                if (attrs.length > 0) {
                    // some sections return a single attribute string like "Core| Univ Writing Req"
                    // split into array cleanly
                    section.attributes = [...new Set(attrs.flatMap(attrStr => attrStr.split("|").map(a => a.trim())))];
                }
                else {
                    section.attributes = [];
                }
            }
        }
    }
    return course;
}
async function patchAllCourses(courses) {
    for (const courseCode of Object.keys(courses)) {
        const patched = await patchCourseAttributes(courses[courseCode]);
        courses[courseCode] = patched;
    }
    for (const [courseKey, courseVal] of Object.entries(courses)) {
        const attrCount = {};
        for (const sectionArray of Object.values(courseVal.sections)) {
            sectionArray.forEach(section => {
                if (section.attributes) {
                    section.attributes.forEach(attr => {
                        if (!attrCount[attr])
                            attrCount[attr] = 0;
                        attrCount[attr]++;
                    });
                }
            });
        }
        // Now see which attributes are common to all sections
        const commonAttrs = [];
        const totalSections = Object.values(courseVal.sections).reduce((sum, arr) => sum + arr.length, 0);
        for (const [attr, count] of Object.entries(attrCount)) {
            if (count === totalSections) {
                commonAttrs.push(attr);
            }
        }
        courseVal.info.attributes = commonAttrs;
    }
    return courses;
}
// ---------------------------
// Adjust GPA for all courses
// ---------------------------
async function adjustGPA(data) {
    for (const [courseKey, courseVal] of Object.entries(data)) {
        let totalGPA = 0;
        let totalSections = 0;
        for (const sectArray of Object.values(courseVal.sections)) {
            for (const section of sectArray) {
                const gpa = section.gpa;
                if (gpa == null)
                    continue;
                totalGPA += gpa;
                totalSections++;
            }
        }
        if (totalSections > 0) {
            courseVal.info.averageGPA = parseFloat((totalGPA / totalSections).toFixed(3));
        }
        else {
            courseVal.info.averageGPA = null;
        }
    }
    return data;
}
// ---------------------------
// Main function
// ---------------------------
async function main() {
    let year = sem.substring(0, 4);
    let semMap = { "1": "Spring", "2": "Summer", "3": "Fall" };
    let semName = semMap[sem.substring(4, 5)];
    // ---------------------------
    // Choose file mode
    // ---------------------------
    const mode = rl.question("Would you like to (1) create a new file or (2) add to an existing file? (enter 1 or 2): ");
    let data = {};
    if (mode === '2') {
        const existingPath = rl.question("Enter the path to the existing JSON file: ");
        try {
            const raw = fs.readFileSync(existingPath, 'utf8');
            data = JSON.parse(raw);
            console.log(`Loaded existing data from ${existingPath}`);
        }
        catch (err) {
            console.error("Error reading existing file:", err);
            process.exit(1);
        }
    }
    console.log("Populating Classes in CSTAT...");
    let newData = await populateClasses.gatherData({}, semName, "College Station", year);
    console.log("----------------------------------------------------------");
    rl.question("Populating Classes in Galveston, Press Enter to Continue:");
    newData = await populateClasses.gatherData(newData, semName, "Galveston", year);
    console.log("----------------------------------------------------------");
    rl.question("Finding missing professors in CSTAT, Press Enter to Continue:");
    newData = await adjustData.findMissingProfessors(newData, "College Station");
    console.log("----------------------------------------------------------");
    rl.question("Finding missing professors in Galveston, Press Enter to Continue:");
    newData = await adjustData.findMissingProfessors(newData, "Galveston");
    if (mode === '2') {
        console.log("Merging with existing data...");
        data = mergeData(data, newData);
    }
    else {
        data = newData;
    }
    console.log("----------------------------------------------------------");
    rl.question("Populating Titles, Press Enter to Continue:");
    data = await adjustData.addTitleAndDesc(data);
    console.log("----------------------------------------------------------");
    rl.question("Adding Students, Press Enter to Continue:");
    data = await adjustData.addStudents(data);
    console.log("----------------------------------------------------------");
    rl.question("Add Attributes to courses, Press Enter to Continue:");
    data = await patchAllCourses(data);
    console.log("----------------------------------------------------------");
    rl.question("Adjusting GPA calculations, Press Enter to Continue:");
    data = await adjustGPA(data);
    // Merge with existing if applicable
    // Clean up semester keys and save
    data = changeSem(data);
    const outFileName = `data_${semName}${year}.json`;
    fs.writeFile(outFileName, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log(`${outFileName} written successfully!`);
    });
}
main();
