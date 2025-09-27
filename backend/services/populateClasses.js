const fetch = require('node-fetch');
const PDFParser = require('pdf2json');
const fs = require('fs')

const url = 'https://web-as.tamu.edu/GradeReports/PDFReports/20242/grd20242';
const departments = ["AE", "AG", "AR", "AP", "AT", "GB", "BA", "ED", "EN", "GV", "MD", "MS", "NS", "PH", "VF", "VM"] // Fall24-Spring25

async function parsePDF(url) {
    const res = await fetch(url);
    const buffer = await res.buffer();

    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
        pdfParser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
        pdfParser.parseBuffer(buffer);
    });
}

function semesterSortKey(semesterStr) {
    const [season, yearStr] = semesterStr.split(" ");
    const year = parseInt(yearStr);
    const seasonOrder = { "Spring": 1, "Summer": 2, "Fall": 3 };
    return year * 10 + seasonOrder[season]; // e.g. "Fall 2024" → 20243
}


function extractCourses(pdfData) {
    const pages = pdfData.Pages;
    const courses = []
    pages.forEach(p => {
        const texts = p.Texts
        let fields = 0
        let onCourse = false
        let info = []
        texts.forEach(t => {
           //console.log(t.R)
           const line = decodeURIComponent(t.R[0].T);
          // console.log(line)

           const regex = /\b[A-Z]{4}-\d{3}-\d{3}\b/;
           const match = line.match(regex);
           if (match || onCourse) { // found the start of a new course line, or in the middle of one
                if (match)
                    info.push(...line.split("-"))
                else
                    info.push(line.trim())
                onCourse = true
                fields++
                if (fields == 20) { // 20 fields total
                    courses.push(info) // push the course info to the array
                    info = [] // reset values
                    onCourse = false
                    fields = 0
                }
           }
        })
    })

    return courses
}

function transformParsedData(parsedRows, year = 2025, semester = "Spring") {
    const courses = {};

    parsedRows.forEach(row => {
        const [
            dept, courseNum,
            section, numA,
            pctA, numB,
            pctB, numC,
            pctC, numD,
            pctD, numF,
            pctF, total,
            gpa, I,
            S, U,
            Q, X,
            studentCount, profName
        ] = row;

        const courseId = `${dept}_${courseNum}`;

        // Initialize if new
        if (!courses[courseId]) {
            courses[courseId] = {
                info: {
                    department: dept,
                    number: parseInt(courseNum),
                    title: '', // Optional: you can fill this separately
                    description: '',

                    averageGPA: 0,
                    totalSections: 0,
                    totalStudents: 0,
                    averageRating: 0,
                    totalRatings: 0,
                },
                professors: [],
                sections: {}
            };
        }

        const sectionData = {
            section: parseInt(section),
            A: parseInt(numA),
            B: parseInt(numB),
            C: parseInt(numC),
            D: parseInt(numD),
            F: parseInt(numF),
            I: parseInt(I),
            S: parseInt(S),
            U: parseInt(U),
            Q: parseInt(Q),
            X: parseInt(X),
            prof: profName,
            year: year,
            semester: semester,
            gpa: parseFloat(gpa),
            students: studentCount
        };

        // Add section
        const termKey = `${semester} ${year}`; // e.g. "Spring 2025"

        if (!courses[courseId].sections) {
            courses[courseId].sections = {};
        }

        if (!courses[courseId].sections[termKey]) {
            courses[courseId].sections[termKey] = [];
        }

        courses[courseId].sections[termKey].push(sectionData);

        // Add professor
        if (!courses[courseId].professors.includes(profName)) {
            courses[courseId].professors.push(profName);
        }

        // Aggregate info
        courses[courseId].info.totalSections += 1;
        courses[courseId].info.totalStudents += parseInt(studentCount);
        courses[courseId].info.averageGPA += parseFloat(gpa);
    });

    // Finalize averages
    for (const course of Object.values(courses)) {
        const total = course.info.totalSections || 1;
        course.info.averageGPA = parseFloat((course.info.averageGPA / total).toFixed(3));
    }

    return courses;
}

function enrichSectionsWithAPI(courseData, apiResponse) {
    for (const entry of apiResponse) {
        const dept = entry.SWV_CLASS_SEARCH_SUBJECT;
        const courseNum = entry.SWV_CLASS_SEARCH_COURSE;
        const sectionNum = parseInt(entry.SWV_CLASS_SEARCH_SECTION);
        const courseKey = `${dept}_${courseNum}`;

        if (!courseData[courseKey]) continue;
        if (courseData[courseKey].professors.length > 0 && typeof courseData[courseKey].professors[0] == "string") {
            courseData[courseKey].professors = []
        }

        const sectionsByTerm = courseData[courseKey].sections;
        let targetSection = null;
        let termKeyOfTarget = null;

        for (const [termKey, sectionArray] of Object.entries(sectionsByTerm)) {
            const found = sectionArray.find(s => s.section === sectionNum);
            if (found) {
                targetSection = found;
                termKeyOfTarget = termKey;
                break;
            }
        }
        if (!targetSection) continue;

        // --- Parse professor (use JSON parse)
        const instructors = JSON.parse(entry.SWV_CLASS_SEARCH_INSTRCTR_JSON);
        let prof = null
        let profName = "";
        if (Array.isArray(instructors) && instructors.length > 0) {
            const primary = instructors.find(inst => inst.NAME.includes("(P)"));
            prof = primary
            profName = (primary || instructors[0]).NAME.split(" (")[0].trim();
        }

        // --- Parse meeting times
        const meetings = JSON.parse(entry.SWV_CLASS_SEARCH_JSON_CLOB);
        const times = {};

        meetings.forEach(meet => {
            const days = {
                M: meet.SSRMEET_MON_DAY,
                T: meet.SSRMEET_TUE_DAY,
                W: meet.SSRMEET_WED_DAY,
                R: meet.SSRMEET_THU_DAY,
                F: meet.SSRMEET_FRI_DAY
            };

            for (const [day, val] of Object.entries(days)) {
                if (val) {
                    if (!times[day]) {
                        times[day] = [meet.SSRMEET_BEGIN_TIME, meet.SSRMEET_END_TIME];
                    } else {
                        times[day].push(...[meet.SSRMEET_BEGIN_TIME, meet.SSRMEET_END_TIME])
                    }
                }
            }
        });

        // --- Parse hours
        const low = entry.SWV_CLASS_SEARCH_HOURS_LOW;
        const high = entry.SWV_CLASS_SEARCH_HOURS_HIGH;
        const med = entry.SWV_CLASS_SEARCH_SSBSECT_HOURS;

        let hours = "";
        if (low && high && low !== high) hours = `${low}-${high}`;
        else if (med) hours = `${med}`;
        else if (low) hours = `${low}`;
        else hours = "N/A";

        // --- Set extra fields
        targetSection.crn = entry.SWV_CLASS_SEARCH_CRN;
        targetSection.hours = hours;
        targetSection.site = entry.SWV_CLASS_SEARCH_SITE || '';
        targetSection.times = times;


        // --- Optionally override prof if needed

        if (prof && !courseData[courseKey].professors.includes(prof?.MORE)) {
            courseData[courseKey].professors.push(prof?.MORE || "");
        }

        if (prof) {
            targetSection.prof_id = prof?.MORE || ""
        }

        if (profName) targetSection.prof = profName;
    }
    console.log(courseData)
    return courseData;
}

async function gatherData(courses = {}, semester, site = "College Station") {
    try {
        if (site == "College Station")
            site = 1
        else
            site = 2
        const response = await fetch("https://howdyportal.tamu.edu/api/course-sections", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json; charset=UTF-8"
            },
            "body": `{\"startRow\":0,\"endRow\":0,\"termCode\":\"${semesterSortKey(semester)}${site}\",\"publicSearch\":\"Y\"}`, //{Year}{Semester}1 (1 = College Station)
            "method": "POST"
        })
        const json = await response.json()
        for (const dept of departments) {
            console.log("Parsing " + dept)
            const pdfData = await parsePDF(url + `${dept}.pdf`);
            const parsedCourses = extractCourses(pdfData);
            const courseObjects =  transformParsedData(parsedCourses, 2024, "Summer");
            //console.log(JSON.stringify(courseObjects, null, 2));
            const enrichedCourses = await enrichSectionsWithAPI(courseObjects, json);
            //console.log(courses)
            for (const [courseCode, courseData] of Object.entries(enrichedCourses)) {
                if (!courses[courseCode]) {
                    console.log(courseCode+ " Not Found!")
                    courses[courseCode] = courseData;
                } else {
                    // Merge sections
                    for (const [semester, sectionsArray] of Object.entries(courseData.sections)) {
                        if (!courses[courseCode].sections[semester]) {
                            courses[courseCode].sections[semester] = sectionsArray;
                        } else {
                            // Append new sections to existing semester
                            courses[courseCode].sections[semester].push(...sectionsArray);
                        }
                        function sortSectionsBySemester(sections) {
                                function semesterSortKey(semesterStr) {
                                    const [season, yearStr] = semesterStr.split(" ");
                                    const year = parseInt(yearStr);
                                    const seasonOrder = { "Spring": 1, "Summer": 2, "Fall": 3 };
                                    return year * 10 + seasonOrder[season]; // e.g. "Fall 2024" → 20243
                                }
                                const entries = Object.entries(sections);
                                entries.sort((a, b) => semesterSortKey(a[0]) - semesterSortKey(b[0]));

                                const sortedSections = {};
                                for (const [term, value] of entries) {
                                    sortedSections[term] = value;
                                }
                                return sortedSections;
                            }
                            courses[courseCode].sections = sortSectionsBySemester(courses[courseCode].sections);
                    }
                }
            }
        }

        console.log(courses)

        
        const jsonString = JSON.stringify(courses, null, 2);
        
        fs.writeFile('data_5.json', jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('data.json written successfully!');
    });
    
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

