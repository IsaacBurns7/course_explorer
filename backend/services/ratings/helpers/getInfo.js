const fs = require('fs');
const {findCourses, parseRatings, parseTags} = require('./findProfs');

// Gets all the information that is stored in the RELAY STORE JSON in the HTML, using findProfs.js
function getInfo(html) {
    const startMarker = 'window.__RELAY_STORE__ = ';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) {
        console.error('❌ Could not find window.__RELAY_STORE__');
        process.exit(1);
    }

    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let jsonStart = html.indexOf('{', startIdx);
    let endIdx = jsonStart;

    while (endIdx < html.length) {
        const char = html[endIdx];

        if (char === '"' && !escaped) {
            inString = !inString;
        }

        if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
        }

        escaped = char === '\\' && !escaped;

        if (braceCount === 0) break;
        endIdx++;
    }

    const jsonText = html.slice(jsonStart, endIdx + 1);

    let relayJson;
    try {
        relayJson = JSON.parse(jsonText);
    } catch (err) {
        console.error('❌ Failed to parse __RELAY_STORE__ JSON:', err.message);
        process.exit(1);
    }

    // Get teacher object
    const root = relayJson['client:root'];
    const teacherKey = Object.keys(root).find(k => k.startsWith('node(id:'));
    const teacherRef = root[teacherKey]?.__ref;
    const teacher = relayJson[teacherRef];

    const school = relayJson[teacher.school.__ref];

    // Get tags and top courses
    const tags = parseTags(html)

    const courses = findCourses(html)
    const ratings = parseRatings(html)


    const result = {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: `${teacher.firstName} ${teacher.lastName}`,
        department: teacher.department,
        school: school.name,
        rating: teacher.avgRating,
        difficulty: teacher.avgDifficulty,
        wouldTakeAgainPercent: teacher.wouldTakeAgainPercent,
        numRatings: teacher.numRatings,
        tags,
        courses,
        ratings
    };
    return result
}

module.exports = {getInfo}