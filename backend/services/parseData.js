const Course = require("../models/course");
const Department = require("../models/department");
const Professor = require("../models/professor");

const { getAnexData,
    getProfessorId,
    getDepartmentCourses,
    getDegreePlan } = require("./fetchData");
const cheerio = require("cheerio");
const PDFParser = require('pdf2json')

//later update ratings aswell    
async function populateSectionsForCourse(dept, number){
    const professorMap = await getAnexData(dept, number);
    let selectedCourse = await Course.findOne({"info.department": dept, "info.number": number});

    if(!selectedCourse){
        let professors = [];
        let sections = [];
        let info = {
            department: dept,
            number,
            averageGPA: 4.00,
            totalSections: 0,
            totalStudents: 0,
            averageRating: 5.00,
            totalRatings: 0
        }
        selectedCourse = await Course.create({info, professors, sections})
    }

    for(const entry of Object.entries(professorMap)){
        const name = entry[0];
        const {info, sections} = entry[1];
        let selectedProfessor = await Professor.findOne({"info.name": name });
        if(!selectedProfessor){
            selectedProfessor = await Professor.create({info: {
                name,
                averageGPA: 4.00,
                totalSections: 0,
                totalStudents: 0,
                averageRating: 5.00,
                totalRatings: 0
            }});
            await addSectionsToProfessorAndCourse({ professor: selectedProfessor, sections, course: selectedCourse});
        }else{
            await addSectionsToProfessorAndCourse({ professor: selectedProfessor, sections, course: selectedCourse});
        }
    };

}

/*
    add sections to course and professor, 
    and return added total GPA and students and sections
    ?update for professor and course
*/
async function addSectionsToProfessorAndCourse({ professor, course, sections}){ 
    //note: currently adds sections not found in course, to both professor and course. 
    //      Could separate in the future to add separate sections to professor / course
    //      and perhaps make new function that explicitly updates existing sections. 
    let addedSections = []; 

    let totalGPA = 0;
    let totalStudents = 0;
    let totalSections = sections.length;
    const { dept, number } = course.info;

    //find duplicates

    for(const section2Obj of sections){
        if(section2Obj.dept === dept && section2Obj.courseNumber === number){
            const existingSection = course.sections.find((section1Obj) => {
                section1Obj.section === section2Obj.section
            });
            if(existingSection){
                continue;
            }
        }
        // console.log(section2Obj);
        const { dept: dept2, courseNumber, ...rest} = section2Obj;

        addedSections.push({
            ...rest,
            section: section2Obj.sectionNumber
        });

        //section2Obj has {A, B, C, D, F, I, S, U, Q, X} biut not totalStudents, averageGPA
        //thats causing NaN
        const letterToGPAandHeadCount = {
            "A": [4,1],
            "B": [3,1],
            "C": [2,1],
            "D": [1,1],
            "F": [0,1],
            "I": [0,0],
            "S": [0,0],
            "U": [0,0],
            "Q": [0,0],
            "X": [0,0]
        };
        let sectionTotalGPA = 0;
        let sectionTotalStudents = 0;
        Object.entries(letterToGPAandHeadCount).forEach(([letterGrade, [gpaValue, headCount]]) => {
            sectionTotalGPA += section2Obj[letterGrade] * gpaValue;
            sectionTotalStudents += section2Obj[letterGrade] * headCount;
        });

        totalGPA += sectionTotalGPA; 
        totalStudents += sectionTotalStudents;
    };

    //update professor to reflect new changes
    const professorId = professor._id;
    const courseId = course._id;
    const professorNewAverageGPA = (professor.info.averageGPA * professor.info.totalStudents + totalGPA) / (professor.info.totalStudents + totalStudents); 
    await Professor.updateOne(
        {
            _id: professorId
        },
        { 
            // sections: [...professor.sections, ...addedSections],
            info: {
                ...professor.info,
                averageGPA: professorNewAverageGPA,
                totalStudents: totalStudents + professor.info.totalStudents,
                totalSections: totalSections + professor.info.totalSections
            },
            $addToSet: {
                courses: courseId
            }
        }
    );
    // console.log("updated professor");

    const courseNewAverageGPA = (course.info.averageGPA * course.info.totalStudents + totalGPA) / (course.info.totalStudents + totalStudents);
    await Course.updateOne(
        {
            _id: courseId
        },
        {
            $set: {
                "info.averageGPA": courseNewAverageGPA,
                "info.totalStudents": totalStudents + course.info.totalStudents,
                "info.totalSections": totalSections + course.info.totalSections,
                sections: [...course.sections, ...addedSections]

            },
            $addToSet: {
                professors: professorId
            }
        }
    );
    console.log("updated course");

    
}

async function populateCourses(deptRaw) {
    const dept = deptRaw.toLowerCase();
    let courses = Course.find({"info.department": dept.toUpperCase()}); 
    const message = [];

    const response = await fetch(`https://catalog.tamu.edu/undergraduate/course-descriptions/${dept}/`, {
            method: "GET"
        })
    const html = await response.text();
    const $ = cheerio.load(html);
    const elements = $(".courseblock").toArray();

    if(elements.length === 0){
        return { error: `Department ${dept} not found or has no course listings.`};
    }

    for(const element of elements){
        const title = $(element).find('.courseblocktitle');
        const desc = $(element).find(".courseblockdesc");

        const number = title.text().slice(5,8);
        const courseTitle = title.text().slice(9);
        const description = desc.text();

        const info = {
            department: dept.toUpperCase(),
            number,
            title: courseTitle,
            description,
            averageGPA: 4.00,
            totalSections: 0,
            totalStudents: 0,
            averageRating: 5.00,
            totalRatings: 0
        }

        const existingCourse = await Course.findOne({"info.department": dept.toUpperCase(), "info.number": number});

        if(existingCourse){
            continue;
        }

        try{   
            const course = await Course.create({info, professors: [], sections: []});
            message.push(course);
        }catch(error){
            message.push(error);
        }
    }
    courses = message;
    // console.log(message);
    console.log("parsing courses finished!");

    return courses;
}


async function parseDegreePlanPDF(pdfBuffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(); // NEW INSTANCE EVERY TIME
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const pages = pdfData.Pages;
            const allText = [];

            pages.forEach((page) => {
                const texts = page.Texts.map(t => decodeURIComponent(t.R[0].T));
                allText.push(...texts);
            });

            const result = extractSemesters(allText);
            resolve(result);
        });

        pdfParser.on("pdfParser_dataError", (err) => {
            reject(err.parserError);
        });

        pdfParser.parseBuffer(pdfBuffer);
    });

    function extractSemesters(textArray) {
        const joined = textArray.join(" ").replace(/\s+/g, " ").trim();

        // Match semesters like "2025 - Spring"
        const semesterRegex = /(\d{4}) - (Fall|Spring|Summer)/g;
        const matches = [...joined.matchAll(semesterRegex)];

        const result = {};

        for (let i = 0; i < matches.length; i++) {
            const year = matches[i][1];
            const term = matches[i][2];
            const nextMatch = matches[i + 1];
            const startIndex = matches[i].index;
            const endIndex = nextMatch ? nextMatch.index : joined.length;
            const block = joined.substring(startIndex, endIndex);

            const key = `${term} ${year}`;
            result[key] = [];

            // Match course entries: e.g., "CSCE 120 PROGRAM DESIGN & CONCEPTS 3"
            const courseRegex = /([A-Z]{2,4}) (\d{3}) ([A-Z0-9&'".,\- ]+?) (\d)(?= [A-Z]{2,4} \d{3}| Term|$)/g;
            const courses = [...block.matchAll(courseRegex)];

            for (const c of courses) {
            result[key].push({
                department: c[1],
                number: c[2],
                title: " " + c[3].trim() + " ",
                hours: c[4],
            });
            }
        }

        return result;
    }
}

function parseViewPlanFormat(text) {
    console.log("Main")
    /*
  const termPattern = /^(\d{4})\s+(Fall|Spring|Summer)/i;
  const coursePattern = /^([A-Z]{2,4})[\t ]+(\d{3})[\t ]+(.+?)[\t ]+(\d+)(?:[\t ].*)?$/;

  const terms = {};
  let currentTerm = null;
  let foundAnyCourses = false;

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
     if (/no planned course/i.test(trimmed)) {
      continue;
    }
    const termMatch = trimmed.match(termPattern);
    
    if (termMatch) {
      const [, year, season] = termMatch;
      currentTerm = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
      terms[currentTerm] = [];
      continue;
    }

    if (currentTerm) {
      const courseMatch = trimmed.match(coursePattern);
      if (courseMatch) {
        const [, dept, num, title, hours] = courseMatch;
        terms[currentTerm].push({
          department: dept,
          number: num,
          title: title.trim(),
          hours: parseInt(hours, 10),
        });
        foundAnyCourses = true;
      }
    }
  }

  if (Object.keys(terms).length === 0) {
    return {error: "Parsing failed: No valid courses found."};
  }
  if (!foundAnyCourses) {
    return {error: "No courses found — you may have copied from the wrong view (use 'View Plan')."};
  }
  return terms;
  */

    const termPattern = /(\d{4})\s*-\s*(Fall|Spring|Summer)/;
    const coursePattern = /([A-Z]{2,4})\s*-\s*(\d{3})\s*\n\((\d)\)\n([A-Z0-9\-\s&']+)/;

    const seen = new Set();
    const lines = text.split(/\r?\n/);
    const terms = {};
    let currentTerm = null;

    for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect a term (e.g. "2024 - Fall")
    const termMatch = line.match(termPattern);
    if (termMatch) {
        const [_, year, season] = termMatch;
        currentTerm = `${season} ${year}`;
        if (!terms[currentTerm]) terms[currentTerm] = [];
        continue;
    }

    // Detect course blocks
    const block = lines.slice(i, i + 4).join("\n");
    const courseMatch = block.match(coursePattern);
    if (courseMatch && currentTerm) {
        const [_, dept, number, hours, title] = courseMatch;

        const obj = {
        department: dept.trim(),
        number: number.trim(),
        title: ` ${title.trim()} `,
        hours: hours.trim(),
        }

        const key = `${currentTerm}-${dept}-${number}`;
        if (seen.has(key)) continue;
        seen.add(key);

        //console.log(seen)
        terms[currentTerm].push(obj);

        i+=3
    }
    }

    //console.log(terms)
    return terms
}

function parseAlternateDegreePlan(text) {
    console.log("Alternate")
  const lines = text.split('\n');

    // Object to store semesters
    const semesters = {};

    // Regex patterns
    const semesterPattern = /(\d{4}) - (Fall|Spring|Summer)/;
    const coursePattern = /^([A-Z]+)\s+(\d+)\s+(.+?)\s+(\d+)$/;

    let currentSemester = null;

    for (let line of lines) {
    line = line.trim();

    console.log(line)

    // Check if the line is a semester
    const semMatch = line.match(semesterPattern);
    if (semMatch) {
        const year = semMatch[1];
        const term = semMatch[2];
        currentSemester = `${term} ${year}`;
        semesters[currentSemester] = [];
        continue;
    }

    // Check if the line is a course
    const courseMatch = line.match(coursePattern);
    if (courseMatch && currentSemester) {
        const [_, department, number, title, hours] = courseMatch;
        semesters[currentSemester].push({
        department,
        number,
        title: ` ${title} `,
        hours
        });
    }
    }

    return semesters
}

function parseDegreePlanText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Look for a line like "GEOG-201" followed by "(3)" -> function1
  const func1Match = lines.some((line, i) => {
    return /^[A-Z]{2,4}-\d{3}$/.test(line) && lines[i + 1] && /^\(\d+\)$/.test(lines[i + 1]);
  });

  // Look for a line like "CHEM 107 GEN CHEM FOR ENGINEERS 3" -> function2
  const func2Match = lines.some(line => /^[A-Z]{2,4}\s+\d{3}\s+.+\s+\d+$/.test(line));

  if (func1Match) {
    return parseViewPlanFormat(text);
  } else if (func2Match) {
    return parseAlternateDegreePlan(text);
  } else {
    return { error: "Parsing failed: No valid courses found." };
  }
}

async function populateDepartments(data) {
    const departments = {}
    const html = require('fs').readFileSync('./services/undergrad_list.html', 'utf8');
    let $ = cheerio.load(html);
    $('ul.nav.leveltwo li a').each((_, element) => {
        const str = $(element).text().trim();       // e.g., "CSCE -​ Computer Sci & Engr (CSCE)"
        const match = str.match(/^([A-Z]{2,5})\s*[-–]\u200b?\s*(.*?)\s*\(/);
        departments[match[1]] = { info: {name: match[2].replace(/^[\s\u200B\u00A0]+|[\s\u200B\u00A0]+$/g, '')}, courses: [] };
    });
    const html2 = require('fs').readFileSync('./services/grad-list.html', 'utf8');
    $ = cheerio.load(html2)
    $('ul.nav.leveltwo li a').each((_, element) => {
        const str = $(element).text().trim();       // e.g., "CSCE -​ Computer Sci & Engr (CSCE)"
        const match = str.match(/^([A-Z]{2,5})\s*-\s*(.+)$/);
        //console.log(str)
        departments[match[1]] = { info: {name: match[2].replace(/^[\s\u200B\u00A0]+|[\s\u200B\u00A0]+$/g, '')}, courses: [] };
    });

    for (const key of Object.keys(data)) {
        const dept = key.split("_")[0]
        if (!departments[dept]) {
            //console.log(dept)
            continue
        }
        departments[dept].courses.push({courseNumber: data[key].info.number, courseTitle: data[key].info.title, courseDescription: data[key].info.description, courseId: key})
    }
    require('fs').writeFileSync('deptdata_FINAL.json', JSON.stringify(departments, null, 2));
}

module.exports = { populateSectionsForCourse, 
    populateCourses, 
    populateDepartments,
    parseDegreePlanPDF,
    parseDegreePlanText
}
