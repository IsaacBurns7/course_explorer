const Course = require('../models/course');
const Professor = require('../models/professor');

const getCourseByProfName = async (req, res) => {
    const { profName } = req.params;

    const professor = await Professor.find({"info.name": profName}) // doing it this way since I'm not sure if the sections.name will be consistent format
    if (!professor) {
        return res.status(404).json({error: `Professor with name ${profName} not found`});
    }
    const courses = await Course.find({ "professors": professor._id });

    if(!courses){
        return res.status(404).json({error: `Professor with name ${profName} not found to teach any class.`});
    }
    return res.status(200).json(courses);
}

const getCourseByProfID = async (req, res) => {
    const { profID } = req.params;
    const courses = await Course.find({ "professors": profID }); // apparently this still works even if its an array
    if(!courses){
        return res.status(404).json({error: `Professor with ID ${profID} not found to teach any class.`});
    }
    return res.status(200).json(courses);
}

// const newCourses = {
//     "CSCE120": {
//         info: {
//             //info about course
//         },
//         "professorId1": {
//             info: {
//                 //info about the professor for this class specifically
//             },
//             "FALL 2024": [
//                 //Array of Sections Objects
//                 {
//                     check DB for section object schema
//                 },
//                 {

//                 }
//             ],
//         },
//         "professorId2": {
//             "FALL 2024": [
//                 {

//                 },
//                 {

//                 }
//             ]
//         }
//     }
// };

//this function makes above 

const getCourseByDeptAndNumber = async (req, res) => {
    const { department, courseNumber } = req.query;
    const course = await Course.findOne({"info.department": department, "info.number": courseNumber});
    const professors = await Professor.find(
        {
            _id: { 
                $in: course.professors 
            }
        }
    );

    if(!course){
        return res.status(400).json({error: "No course with that dept and number exists"});
    }

    const courseObject = {
        info: course.info,
    }

    for(const professor of professors){
        const professorId = professor._id.toString();
        const professorObject = {
            info: professor.info
        }
        courseObject[professorId] = professorObject;
    }
    const sectionsMap = course.sections;
    for(const [term, sectionArray] of sectionsMap){
        for(const section of sectionArray){
            if(!section.prof_id) continue; //act as though section does not exist.
            const professorId = section.prof_id.toString();
            if(!courseObject[professorId]){
                throw new Error("Course Controller - getCourseByDeptAndNumber - courseObject does not have professor with professorId: ", professorId, ". Proceeding with initialization...");
            }

            const professorData = courseObject[professorId] || new Map();
            const termSections = professorData[term] || new Map();
            
            courseObject[professorId] = {
                ...professorData,
                [term]: [...termSections, section]
            }
        }
    }
    return res.status(200).json(
        {
            [`${department} ${courseNumber}`]: courseObject
        }
    );
}

/*
Need to create series data
categories: ["category1", "category2"]
seriesData: [valueForCategory1, valueForCategory2]

[
    ["A", aCount]
]
*/
const getGraphSeriesForProfessorAndCourse = async(req, res) => {
    const { department, courseNumber, professorID } = req.query;
    const selectedCourse = await Course.findOne(
        {
            "info.department" : department, 
            "info.number": courseNumber
        }
    );
    // console.log(department, courseNumber, selectedCourse);

    if(!selectedCourse){
        return res.status(400).json({error: "No course found with specified department and courseNumber"});
    }

    const categories = ["A", "B", "C", "D", "F", "I", "S", "U", "Q", "X"];

    const data = categories.map((category) => {
        return [
            category,
            0
        ]
    });

    for(const [semester, sections] of selectedCourse.sections){
        // if(semester in validSemesters)
        for(const section of sections){
            if(section.prof_id === undefined || section.prof_id !== professorID) continue;
            for(const category of categories){
                const value = section[category];
                const index = data.findIndex(item => item[0] === category);
                data[index][1] += Number(value);
            }
        }
    }

    return res.status(200).json(data);
}

module.exports = { getCourseByProfID, getCourseByProfName, getCourseByDeptAndNumber, getGraphSeriesForProfessorAndCourse };