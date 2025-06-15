const Course = require("../models/course");
const Department = require("../models/department");
const Professor = require("../models/professor");

const { getAnexData,
    getProfessorId,
    getDepartmentCourses,
    getDegreePlan } = require("./fetchData");
const cheerio = require("cheerio");


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

async function populateDepartments() {

}

module.exports = { populateSectionsForCourse, 
    populateCourses, 
    populateDepartments    
}