"use strict";
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
(async () => {
    let courses = require('./services/data_Fall2025.json');
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
    const fs = require('fs');
    fs.writeFileSync('./services/data_Fall2025_patched.json', JSON.stringify(courses, null, 2), 'utf-8');
})();
