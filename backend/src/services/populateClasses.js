const fetch = require('node-fetch');
const PDFParser = require('pdf2json');
const fs = require('fs')


const departments = ["AE", "AG", "AR", "AP", "AT", "GB", "BA", "ED", "EN", "GV", "MD", "MS", "NS", "PH", "VF", "VM"] // Fall24-Spring25

async function parsePDF(dept, year, semester) {
    
    const url = `https://web-as.tamu.edu/GradeReports/PDFReports/${year}${semester}/grd${year}${semester}${dept}.pdf`;
    console.log(url)
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

function isSemesterOver(semesterString) {
  const now = new Date();

  // Extract semester and year
  const match = semesterString.match(/^(Spring|Summer|Fall)\s+(\d{4})$/i);
  if (!match) return null; // invalid format

  const [, semester, yearStr] = match;
  const year = parseInt(yearStr, 10);

  let endDate;

  // Assign approximate semester end dates
  switch (semester.toLowerCase()) {
    case "spring":
      endDate = new Date(year, 4, 31); // May 31
      break;
    case "summer":
      endDate = new Date(year, 7, 31); // Aug 31
      break;
    case "fall":
      endDate = new Date(year, 11, 31); // Dec 31
      break;
    default:
      return null;
  }

  return now > endDate;
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

           const regex = /\b[A-Z]{4}-\d{3}-[A-Z0-9]{3}\b/;
           const match = line.match(regex);
           if (match || onCourse) { // found the start of a new course line, or in the middle of one
                
                if (match)
                    info.push(...line.split("-"))
                else
                    info.push(line.trim())
                console.log("Match: " + info)
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
                title: '',
                description: '',
                averageGPA: 0,
                totalSections: 0,
                totalStudents: 0,
                averageRating: 0,
                totalRatings: 0,
                validGpaCount: 0  // <-- new field to track valid GPA entries
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
    const termKey = `${semester} ${year}`;
    console.log(termKey)
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

    // Only include non-zero GPA in the average
    const gpaValue = parseFloat(gpa);
    if (gpaValue > 0) {
        courses[courseId].info.averageGPA += gpaValue;
        courses[courseId].info.validGpaCount += 1;
    }
});

for (const course of Object.values(courses)) {
    const validCount = course.info.validGpaCount || 1; // avoid divide by zero
    course.info.averageGPA = parseFloat((course.info.averageGPA / validCount).toFixed(3));

    // Optionally, remove the helper field
    delete course.info.validGpaCount;
}

    console.log(courses)
    return courses;
}

function enrichSectionsWithAPI(courseData, apiResponse) {
    for (const entry of apiResponse) {
        const dept = entry.SWV_CLASS_SEARCH_SUBJECT;
        const courseNum = entry.SWV_CLASS_SEARCH_COURSE;
        const sectionNum = parseInt(entry.SWV_CLASS_SEARCH_SECTION);
        const courseKey = `${dept}_${courseNum}`;

        // --- Initialize course if missing
        if (!courseData[courseKey]) {
            courseData[courseKey] = {
        info: {
            department: dept,
            number: parseInt(courseNum),
            title: '',
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

        if (courseData[courseKey].professors.length > 0 && typeof courseData[courseKey].professors[0] === "string") {
            courseData[courseKey].professors = [];
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

        // If section wasn’t found, create it in a default term (or use CRN’s term if available)
        if (!targetSection) {
            const termKey = entry.SWV_CLASS_SEARCH_TERM || "UNKNOWN_TERM";
            if (!sectionsByTerm[termKey]) sectionsByTerm[termKey] = [];

            targetSection = {
                section: sectionNum
            };
            sectionsByTerm[termKey].push(targetSection);
            termKeyOfTarget = termKey;
        }

        // --- Parse professor (use JSON parse)
        const instructors = JSON.parse(entry.SWV_CLASS_SEARCH_INSTRCTR_JSON);
        let prof = null;
        let profName = "";
        if (Array.isArray(instructors) && instructors.length > 0) {
            const primary = instructors.find(inst => inst.NAME.includes("(P)"));
            prof = primary;
            profName = (primary || instructors[0]).NAME.split(" (")[0].trim();
        }

        // --- Parse meeting times
        //console.log(entry)
        const meetings = JSON.parse(entry.SWV_CLASS_SEARCH_JSON_CLOB);
        const times = {};

        if (meetings) {
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
                        times[day].push(...[meet.SSRMEET_BEGIN_TIME, meet.SSRMEET_END_TIME]);
                    }
                }
            }
        });
    }
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
        let attributes = []
                if (entry.SWV_CLASS_SEARCH_ATTRIBUTES) attributes = entry.SWV_CLASS_SEARCH_ATTRIBUTES
                .split("| ")
        targetSection.attributes = attributes;
        targetSection.crn = entry.SWV_CLASS_SEARCH_CRN;
        targetSection.hours = hours;
        targetSection.site = entry.SWV_CLASS_SEARCH_SITE || "";
        targetSection.times = times;

        
        // --- Optionally override prof if needed
        if (prof && !courseData[courseKey].professors.includes(prof?.MORE)) {
            courseData[courseKey].professors.push(prof?.MORE || "");
        }

        if (prof) {
            targetSection.prof_id = prof?.MORE || "";
        }

        if (profName) targetSection.prof = profName;
    }

    // loop through sections to see common attributes, and put it in class info
    for (const [courseKey, courseVal] of Object.entries(courseData)) {
        const attrCount = {};
        for (const sectionArray of Object.values(courseVal.sections)) {
            sectionArray.forEach(section => {
                if (section.attributes) {
                    section.attributes.forEach(attr => {
                        if (!attrCount[attr]) attrCount[attr] = 0;
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

    //console.log(courseData);
    return courseData;
}

async function gatherData(courses = {}, semester, site = "College Station", year) {
    try {
        if (site == "College Station")
            site = 1
        else
            site = 2
        const seasonOrder = { "Spring": 1, "Summer": 2, "Fall": 3 };
        console.log(semesterSortKey(semester))
        const response = await fetch("https://howdyportal.tamu.edu/api/course-sections", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json; charset=UTF-8"
            },
            "body": `{\"startRow\":0,\"endRow\":0,\"termCode\":\"${year}${seasonOrder[semester]}${site}\",\"publicSearch\":\"Y\"}`, //{Year}{Semester}1 (1 = College Station)
            "method": "POST"
        })
        const json = await response.json()
        //console.log(json)
        for (const dept of departments) {
    console.log("Parsing " + dept);
    
    let courseObjects = {};

    if (isSemesterOver(`${semester} ${year}`)) {
        // --- Semester passed: use archived PDF data
        const pdfData = await parsePDF(dept, year, seasonOrder[semester]);
        const parsedCourses = extractCourses(pdfData);
        courseObjects = transformParsedData(parsedCourses, year, semester);
        console.log(courseObjects)
    } else {
        // --- Semester ongoing: seed courses from API
        courseObjects = {}; // empty container
        for (const entry of json) {
            if (entry.SWV_CLASS_SEARCH_SUBJECT !== dept) continue;

            const courseKey = `${entry.SWV_CLASS_SEARCH_SUBJECT}_${entry.SWV_CLASS_SEARCH_COURSE}`;
            console.log(entry)
            if (!courseObjects[courseKey]) {
                let attributes = []
                if (entry.SWV_CLASS_SEARCH_ATTRIBUTES) attributes = entry.SWV_CLASS_SEARCH_ATTRIBUTES
                .split("| ")
                .filter(attr => attr.includes("Core") || attr.includes("Univ"));
                courseObjects[courseKey] = {
        info: {
            department: entry.SWV_CLASS_SEARCH_SUBJECT,
            number: parseInt(entry.SWV_CLASS_SEARCH_COURSE),
            attributes: attributes,
            title: '',
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
            // Create empty section for API enrichment
            const sectionNum = parseInt(entry.SWV_CLASS_SEARCH_SECTION);
            const termKey = `${semester} ${year}`;
            console.log(termKey)
            if (!courseObjects[courseKey].sections[termKey]) {
                courseObjects[courseKey].sections[termKey] = [];
            }
            courseObjects[courseKey].sections[termKey].push({ section: sectionNum });
        }

        //console.log("courseObjects:")
        //console.log(courseObjects)
    }

    // Now enrich regardless of where data came from
    const enrichedCourses = await enrichSectionsWithAPI(courseObjects, json);

    for (const [courseCode, courseData] of Object.entries(enrichedCourses)) {
        if (!courses[courseCode]) {
            console.log(courseCode + " Not Found!");
            courses[courseCode] = courseData;
        } else {
            // Merge sections
            for (const [semester, sectionsArray] of Object.entries(courseData.sections)) {
                console.log(semester)
                if (!courses[courseCode].sections[semester]) {
                    courses[courseCode].sections[semester] = sectionsArray;
                } else {
                    courses[courseCode].sections[semester].push(...sectionsArray);
                }

                // Sort sections by semester
                //courses[courseCode].sections = sortSectionsBySemester(courses[courseCode].sections);
            }
        }
    }

    if (!isSemesterOver(`${semester} ${year}`)) break;
}

        console.log(courses)

        
        const jsonString = JSON.stringify(courses, null, 2);

        return courses
        
        fs.writeFile(`data_${semester}${year}_${site}.json`, jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log(`data_${semester}${year}_${site}.json written successfully!`);
    });
    
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

async function getPrereq(courseData) {
  const seasonOrder = { Spring: 1, Summer: 2, Fall: 3 };
  const site = { "College Station": 1, Galveston: 2 };

  for (const course of Object.keys(courseData)) {
    const sections = courseData[course].sections;
    const semesters = Object.keys(sections);

    // Skip if no sections
    if (!semesters.length) continue;

    // 🧠 Find latest semester (largest numeric term)
    let maxTerm = -Infinity;
    let maxSemester = null;
    for (const sem of semesters) {
      const [season, yearStr] = sem.split(" ");
      if (!seasonOrder[season]) continue; // skip weird keys

      const numericTerm = parseInt(`${yearStr}${seasonOrder[season]}`);
      if (numericTerm > maxTerm) {
        maxTerm = numericTerm;
        maxSemester = sem;
      }
    }

    if (!maxSemester) continue; // no valid semester found
    const [maxSeason, maxYearStr] = maxSemester.split(" ");
    const baseTerm = `${maxYearStr}${seasonOrder[maxSeason]}`;

    // 🧭 Pick the first valid section in that semester
    const targetSection = sections[maxSemester].find((s) => s.crn);
    if (!targetSection) continue;

    const currentTerm = baseTerm + (site[targetSection.site] || "1");

    console.log(`Fetching for ${course}, term ${currentTerm}`);

    try {
      const response = await fetch("https://howdyportal.tamu.edu/api/section-prereqs", {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          term: currentTerm,
          crn: targetSection.crn,
        }),
        method: "POST",
      });

      const json = await response.json();

      if (json?.P_PRE_REQS_OUT) {
        courseData[course].info.prereqString = json.P_PRE_REQS_OUT;
      } else {
        console.warn(`No prereq found for ${course}`);
      }
    } catch (err) {
      console.error(`Error fetching ${course}:`, err.message);
    }
  }

  // ✅ Write once at the end

  return courseData
  fs.writeFileSync("data_Spring2026_Prereq.json", JSON.stringify(courseData, null, 2), "utf8");
  console.log("✅ data_Spring2026_Prereq.json written successfully!");
}

module.exports = { gatherData, getPrereq }
