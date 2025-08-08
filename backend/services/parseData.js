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
        const semesterPattern = /^(Fall|Spring|Summer)\s2\d{3}$/;
        const results = {};
        let currentSemester = null;
        let currentCourses = [];

        for (let i = 0; i < textArray.length; i++) {
            const line = textArray[i];

            if (semesterPattern.test(line)) {
                if (currentSemester) {
                    results[currentSemester] = [...currentCourses];
                }
                currentSemester = line.trim();
                currentCourses = [];
            } else if (/^Term Total Credits:/i.test(line)) {
                if (currentSemester) {
                    results[currentSemester] = [...currentCourses];
                    currentSemester = null;
                    currentCourses = [];
                }
            } else if (line.match(/^[A-Z]{2,4} \d{3}/)) {
                const course = line.split(" ");
                currentCourses.push({
                    department: course[0],
                    number: course[1],
                    title: "",
                    hours: ""
                });
            } else if (currentCourses.length > 0) {
                if (/^\d$/.test(line)) {
                    currentCourses[currentCourses.length - 1].hours = line;
                } else {
                    currentCourses[currentCourses.length - 1].title += ' ' + line;
                }
            }
        }

        if (currentSemester) {
            results[currentSemester] = [...currentCourses];
        }

        return results;
    }
}

function parseViewPlanFormat(text) {
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
}

function parseAlternateDegreePlan(text) {
  const termPattern = /^(\d{4})\s*-\s*(Fall|Spring|Summer)/i;
  const coursePattern = /^([A-Z]{2,4})\s*-\s*(\d{3})\s*\((\d+)\)/;

  const terms = {};
  let currentTerm = null;
  let foundAnyCourses = false;

  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Detect a term header
    const termMatch = trimmed.match(termPattern);
    if (termMatch) {
      const [, year, season] = termMatch;
      currentTerm = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
      terms[currentTerm] = [];
      continue;
    }

    // Detect course line
    if (currentTerm) {
      const courseMatch = trimmed.match(coursePattern);
      if (courseMatch) {
        const [, dept, num, hours] = courseMatch;

        // Get title from next non-empty line
        let title = "";
        let j = i + 1;
        while (j < lines.length && title === "") {
          const nextLine = lines[j].trim();
          if (nextLine && !/^[A-Z]{1,4}$/.test(nextLine)) {
            title = nextLine;
            break;
          }
          j++;
        }

        // Check if TCR label exists right after title
        let skipCourse = false;
        let k = j + 1;
        while (k < lines.length) {
          const nextLine = lines[k].trim();
          if (nextLine) {
            if (nextLine.toUpperCase() === "TCR") {
              skipCourse = true;
            }
            break;
          }
          k++;
        }

        // Only add if not skipped
        if (!skipCourse) {
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
  }

  if (Object.keys(terms).length === 0) {
    return {error: "Parsing failed: No valid courses found."};
  }
  if (!foundAnyCourses) {
    return {error: "No courses found — please make sure you copied from the correct view."}
  }
  return terms;
}

function parseDegreePlanText(text) {
  const hasViewPlanPattern = /^\d{4}\s+(Fall|Spring|Summer)/m.test(text);
  const hasAlternatePattern = /^\d{4}\s*-\s*(Fall|Spring|Summer)/m.test(text);

  if (hasViewPlanPattern && !hasAlternatePattern) {
    return parseViewPlanFormat(text);
  }
  if (hasAlternatePattern && !hasViewPlanPattern) {
    return parseAlternateDegreePlan(text);
  }

  // If it matches neither or both (ambiguous)
  return {error: "Parsing failed: No valid courses found."};
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
        console.log(str)
        departments[match[1]] = { info: {name: match[2].replace(/^[\s\u200B\u00A0]+|[\s\u200B\u00A0]+$/g, '')}, courses: [] };
    });

    for (const key of Object.keys(data)) {
        const dept = key.split("_")[0]
        if (!departments[dept]) {
            console.log(dept)
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
